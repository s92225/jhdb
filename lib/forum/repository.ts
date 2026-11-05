import { randomUUID } from 'node:crypto'
import type { PoolClient } from 'pg'
import { getPool, transaction } from '@/lib/db'
import type { Actor } from './session'
import { ForumError, postInput, profileInput, text, validId } from './validation'

export type Thread = { id:string; title:string; body:string; category:string; authorId:string; displayName:string; gameId:string; pinned:boolean; locked:boolean; hidden:boolean; createdAt:string; updatedAt:string; activityAt:string; replyCount:number }
export type Reply = { id:string; postId:string; authorId:string; displayName:string; gameId:string; body:string; hidden:boolean; createdAt:string; updatedAt:string }
const POST_COLUMNS = `p.id,p.title,p.body,p.category,p.author_id AS "authorId",u.display_name AS "displayName",u.game_id AS "gameId",p.pinned,p.locked,(p.hidden_at IS NOT NULL) AS hidden,p.created_at AS "createdAt",p.updated_at AS "updatedAt",p.activity_at AS "activityAt",(SELECT count(*)::int FROM forum_replies r WHERE r.post_id=p.id AND r.hidden_at IS NULL) AS "replyCount"`
const REPLY_COLUMNS = `r.id,r.post_id AS "postId",r.author_id AS "authorId",r.body,u.display_name AS "displayName",u.game_id AS "gameId",(r.hidden_at IS NOT NULL) AS hidden,r.created_at AS "createdAt",r.updated_at AS "updatedAt"`

async function throttle(client: PoolClient, actor: Actor, action: string) {
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[actor.id])
  await client.query("DELETE FROM forum_actions WHERE user_id=$1 AND created_at<now()-interval '1 day'",[actor.id])
  const { rows } = await client.query(`SELECT count(*)::int AS n FROM forum_actions WHERE user_id=$1 AND created_at>now()-interval '1 minute'`,[actor.id])
  if (rows[0].n >= 6) throw new ForumError(429,'提交太頻密，請稍候一分鐘。')
  if (action === 'post') {
    const recent = await client.query(`SELECT count(*)::int AS n FROM forum_actions WHERE user_id=$1 AND action='post' AND created_at>now()-interval '10 minutes'`,[actor.id])
    if (recent.rows[0].n >= 3) throw new ForumError(429,'每十分鐘最多發表三個主題，請稍後再試。')
  }
  await client.query('INSERT INTO forum_actions(user_id,action) VALUES ($1,$2)',[actor.id,action])
}
export async function listThreads(options: { q?:string; category?:string; page?:number; sort?:string; hidden?:boolean }, actor?: Actor | null) {
  if (options.hidden && !actor?.isAdmin) throw new ForumError(403,'需要管理員權限。')
  const page = Math.max(1,Math.min(10000,Math.floor(options.page || 1)))
  const q = (options.q || '').trim().slice(0,100); const category = options.category || ''
  const where = `WHERE ($1::boolean OR p.hidden_at IS NULL) AND ($2='' OR p.category=$2) AND ($3='' OR strpos(lower(p.title||' '||p.body),lower($3))>0)`
  const params = [Boolean(options.hidden && actor?.isAdmin), category, q]
  const count = await getPool().query(`SELECT count(*)::int AS total FROM forum_posts p ${where}`,params)
  const sort = options.sort === 'newest' ? 'p.created_at' : 'p.activity_at'
  const result = await getPool().query(`SELECT ${POST_COLUMNS} FROM forum_posts p JOIN forum_profiles u ON u.user_id=p.author_id ${where} ORDER BY p.pinned DESC,${sort} DESC,p.id LIMIT 20 OFFSET $4`,[...params,(page-1)*20])
  return { posts: result.rows as Thread[], total: count.rows[0].total as number, page, pageSize:20 }
}
export async function threadDetail(id: string, actor?: Actor | null, page=1) {
  validId(id)
  const post = await getPool().query(`SELECT ${POST_COLUMNS} FROM forum_posts p JOIN forum_profiles u ON u.user_id=p.author_id WHERE p.id=$1 AND (p.hidden_at IS NULL OR $2::boolean)`,[id,Boolean(actor?.isAdmin)])
  if (!post.rows[0]) throw new ForumError(404,'找不到此討論，或帖子已被隱藏。')
  page = Math.max(1,Math.min(10000,Math.floor(page || 1)))
  const offset = (page-1)*50
  const replies = await getPool().query(`SELECT ${REPLY_COLUMNS} FROM forum_replies r JOIN forum_profiles u ON u.user_id=r.author_id WHERE r.post_id=$1 AND (r.hidden_at IS NULL OR $2::boolean) ORDER BY r.created_at,r.id LIMIT 50 OFFSET $3`,[id,Boolean(actor?.isAdmin),offset])
  const count = await getPool().query('SELECT count(*)::int AS total FROM forum_replies WHERE post_id=$1 AND (hidden_at IS NULL OR $2::boolean)', [id,Boolean(actor?.isAdmin)])
  return { post: post.rows[0] as Thread, replies: replies.rows as Reply[], replyTotal: count.rows[0].total as number, page, pageSize: 50 }
}
export async function createThread(actor: Actor, input: Record<string,unknown>) {
  const post = postInput(input); const id=randomUUID()
  await transaction(async (client) => {
    await throttle(client,actor,'post')
    await client.query('INSERT INTO forum_posts(id,author_id,title,body,category) VALUES($1,$2,$3,$4,$5)',[id,actor.id,post.title,post.body,post.category])
  })
  return { id }
}
export async function replyThread(actor: Actor, postId:string, input: Record<string,unknown>) {
  validId(postId); const body=text(input.body,'回覆',2,12000); const id=randomUUID()
  await transaction(async (client) => {
    await throttle(client,actor,'reply')
    const {rows}=await client.query('SELECT locked,hidden_at FROM forum_posts WHERE id=$1 FOR UPDATE',[postId])
    if (!rows[0] || rows[0].hidden_at) throw new ForumError(404,'找不到此討論。')
    if (rows[0].locked) throw new ForumError(409,'此討論已鎖定，不能新增回覆。')
    await client.query('INSERT INTO forum_replies(id,post_id,author_id,body) VALUES($1,$2,$3,$4)',[id,postId,actor.id,body])
    await client.query('UPDATE forum_posts SET activity_at=now() WHERE id=$1',[postId])
  })
  return { id }
}
export async function changeThread(actor: Actor, id:string, input: Record<string,unknown>) {
  validId(id)
  await transaction(async (client) => {
    const {rows}=await client.query('SELECT * FROM forum_posts WHERE id=$1 FOR UPDATE',[id])
    const post=rows[0]; if(!post) throw new ForumError(404,'找不到此討論。')
    if (input.action === 'edit') {
      if (post.author_id !== actor.id && !actor.isAdmin) throw new ForumError(403,'只可編輯自己的帖子。')
      if ((post.locked || post.hidden_at) && !actor.isAdmin) throw new ForumError(409,'此討論已鎖定或隱藏，不能編輯。')
      const data=postInput(input); await throttle(client,actor,'edit')
      await client.query('UPDATE forum_posts SET title=$1,body=$2,category=$3,updated_at=now() WHERE id=$4',[data.title,data.body,data.category,id])
      if (actor.isAdmin && post.author_id!==actor.id) await client.query('INSERT INTO forum_moderation(actor_id,target_id,action) VALUES($1,$2,$3)',[actor.id,id,'edit-post'])
    } else {
      if (!actor.isAdmin) throw new ForumError(403,'需要管理員權限。')
      if (!['pin','unpin','lock','unlock','hide','restore'].includes(String(input.action))) throw new ForumError(400,'不支援的版務操作。')
      const action=String(input.action)
      if (action==='pin'||action==='unpin') await client.query('UPDATE forum_posts SET pinned=$1 WHERE id=$2',[action==='pin',id])
      if (action==='lock'||action==='unlock') await client.query('UPDATE forum_posts SET locked=$1 WHERE id=$2',[action==='lock',id])
      if (action==='hide'||action==='restore') await client.query('UPDATE forum_posts SET hidden_at=CASE WHEN $1 THEN now() ELSE NULL END WHERE id=$2',[action==='hide',id])
      await client.query('INSERT INTO forum_moderation(actor_id,target_id,action) VALUES($1,$2,$3)',[actor.id,id,action])
    }
  })
  return { ok:true }
}
export async function changeReply(actor:Actor,id:string,input:Record<string,unknown>) {
  validId(id)
  await transaction(async(client)=>{
    const {rows}=await client.query('SELECT r.*,p.locked,p.hidden_at AS post_hidden FROM forum_replies r JOIN forum_posts p ON p.id=r.post_id WHERE r.id=$1 FOR UPDATE OF p,r',[id])
    const reply=rows[0]; if(!reply)throw new ForumError(404,'找不到此回覆。')
    if(input.action==='edit') {
      if(reply.author_id!==actor.id && !actor.isAdmin)throw new ForumError(403,'只可編輯自己的回覆。')
      if((reply.locked||reply.hidden_at||reply.post_hidden)&&!actor.isAdmin)throw new ForumError(409,'此討論不能編輯。')
      const body=text(input.body,'回覆',2,12000);await throttle(client,actor,'edit')
      await client.query('UPDATE forum_replies SET body=$1,updated_at=now() WHERE id=$2',[body,id])
      if (actor.isAdmin && reply.author_id!==actor.id) await client.query('INSERT INTO forum_moderation(actor_id,target_id,action) VALUES($1,$2,$3)',[actor.id,id,'edit-reply'])
    } else {
      if(!actor.isAdmin)throw new ForumError(403,'需要管理員權限。')
      if(!['hide','restore'].includes(String(input.action)))throw new ForumError(400,'不支援的操作。')
      await client.query('UPDATE forum_replies SET hidden_at=CASE WHEN $1 THEN now() ELSE NULL END WHERE id=$2',[input.action==='hide',id])
      await client.query('INSERT INTO forum_moderation(actor_id,target_id,action) VALUES($1,$2,$3)',[actor.id,id,`reply-${input.action}`])
    }
  })
  return {ok:true}
}
export async function saveProfile(actor:Actor,input:Record<string,unknown>) {
  const profile=profileInput(input)
  await transaction(async(client)=>{await throttle(client,actor,'profile');await client.query('UPDATE forum_profiles SET display_name=$1,game_id=$2,updated_at=now() WHERE user_id=$3',[profile.displayName,profile.gameId,actor.id])})
  return {ok:true,...profile}
}
