// Explicit opt-in integration tests. Creates only disposable identities and cleans up their own IDs.
// This does not test Google's OAuth flow and installs no test endpoint or login bypass.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { loadEnvConfig } from '@next/env'

async function main() {
  loadEnvConfig(process.cwd())
  if(process.env.FORUM_INTEGRATION_TEST!=='1')throw Error('Set FORUM_INTEGRATION_TEST=1 to test against the configured database.')
  const { getPool }=await import('../lib/db')
  const { getAuth }=await import('../lib/auth')
  const { makeSignature }=await import('better-auth/crypto')
  const { currentMember }=await import('../lib/forum/session')
  const repo=await import('../lib/forum/repository')
  const pool=getPool();const ctx=await getAuth().$context
  const ids:string[]=[]; const posts:string[]=[]
  async function user(verified:boolean,google:boolean) {
    const id=randomUUID(); ids.push(id)
    await pool.query('INSERT INTO "user" (id,name,email,"emailVerified","createdAt","updatedAt") VALUES($1,$2,$3,$4,now(),now())',[id,'Disposable integration identity',`${id}@example.invalid`,verified])
    if(google)await ctx.internalAdapter.createAccount({userId:id,providerId:'google',accountId:`disposable-${id}`})
    const session=await ctx.internalAdapter.createSession(id)
    const signature=await makeSignature(session.token,ctx.secret)
    const headers=new Headers({cookie:`${ctx.authCookies.sessionToken.name}=${encodeURIComponent(`${session.token}.${signature}`)}`})
    return {id,isAdmin:false,headers}
  }
  const expectStatus=(status:number)=>(error:unknown)=>Boolean(error&&typeof error==='object'&&'status'in error&&error.status===status)
  try {
    const owner=await user(true,true),other=await user(true,true),unverified=await user(false,true),unlinked=await user(true,false)
    assert.equal(await currentMember(unverified.headers),null)
    assert.equal(await currentMember(unlinked.headers),null)
    assert.equal((await currentMember(owner.headers))?.id,owner.id)
    assert.equal((await currentMember(other.headers))?.isAdmin,false)
    const admin={id:other.id,isAdmin:true} // Repository authorization unit boundary; NOT a granted account role.
    const data={title:'整合測試：氣勢規則',body:'這是自動化整合測試，測試結束後會清除。',category:'questions'}
    const {id}=await repo.createThread(owner,data);posts.push(id)
    assert.equal((await repo.threadDetail(id)).post.title,data.title)
    await assert.rejects(repo.changeThread(other,id,{...data,action:'edit'}),expectStatus(403))
    await assert.rejects(repo.changeThread(other,id,{action:'pin'}),expectStatus(403))
    await repo.changeThread(admin,id,{action:'pin'})
    assert.equal((await repo.threadDetail(id)).post.pinned,true)
    const reply=await repo.replyThread(other,id,{body:'測試回覆：補充一項線索。'})
    assert.equal((await repo.threadDetail(id)).replyTotal,1)
    await assert.rejects(repo.changeReply(owner,reply.id,{action:'edit',body:'嘗試修改他人回覆'}),expectStatus(403))
    await repo.changeReply(admin,reply.id,{action:'hide'})
    assert.equal((await repo.threadDetail(id)).replyTotal,0)
    assert.equal((await repo.threadDetail(id,admin)).replyTotal,1)
    await repo.changeReply(admin,reply.id,{action:'restore'})
    await repo.changeThread(admin,id,{action:'lock'})
    await assert.rejects(repo.replyThread(owner,id,{body:'鎖定後不能回覆。'}),expectStatus(409))
    await repo.changeThread(admin,id,{action:'unlock'})
    await repo.changeThread(admin,id,{action:'hide'})
    await assert.rejects(repo.threadDetail(id),expectStatus(404))
    assert.equal((await repo.threadDetail(id,admin)).post.hidden,true)
    await assert.rejects(repo.listThreads({hidden:true},owner),expectStatus(403))
    assert.ok((await repo.listThreads({hidden:true,q:data.title},admin)).posts.some((p)=>p.id===id))
    await repo.changeThread(admin,id,{action:'restore'})
    await repo.saveProfile(owner,{displayName:'測試同道',gameId:'test_123'})
    assert.equal((await currentMember(owner.headers))?.gameId,'test_123')
    // Six successful owner actions per minute, then a seventh is rejected.
    for(let i=0;i<4;i++)await repo.saveProfile(owner,{displayName:'測試同道',gameId:`test_${i}`})
    await assert.rejects(repo.saveProfile(owner,{displayName:'測試同道',gameId:'limited'}),expectStatus(429))
    if(process.env.FORUM_TEST_BASE_URL) {
      const base=new URL(process.env.FORUM_TEST_BASE_URL)
      if(base.hostname!=='localhost'&&base.hostname!=='127.0.0.1')throw Error('HTTP integration is limited to localhost.')
      const request=(path:string,method='GET',body?:unknown,cookie?:string)=>fetch(new URL(path,base),{method,headers:{origin:base.origin,...(cookie?{cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})})
      assert.equal((await request('/api/forum')).status,200)
      assert.equal((await request('/api/forum','POST',data)).status,401)
      assert.equal((await request('/api/forum?hidden=true')).status,403)
      const memberResponse=await request('/api/forum/me','GET',undefined,other.headers.get('cookie')!)
      assert.equal(memberResponse.status,200)
      const memberData=await memberResponse.json()
      assert.equal(memberData.member.id,other.id)
      assert.equal(memberData.member.isAdmin,false)
      assert.equal('email' in memberData.member,false)
      // Reject server-side privilege escalation, even with a valid signed session.
      assert.equal((await request('/api/forum/me','PATCH',{displayName:'測試同道',isAdmin:true},other.headers.get('cookie')!)).status,400)
      const posted=await request('/api/forum','POST',data,other.headers.get('cookie')!)
      assert.equal(posted.status,200)
      const postedId=(await posted.json()).id;posts.push(postedId)
      assert.equal((await request(`/api/forum/${postedId}`)).status,200)
      assert.equal((await request(`/api/forum/${postedId}`,'PATCH',{action:'pin'},other.headers.get('cookie')!)).status,403)
      console.log('Local HTTP routes: persistence, cookie authentication, private email, admin rejection and unauthenticated guards passed')
    }
    console.log('Real Neon persistence, signed sessions, Google/verified gates, ownership, moderation, locks and rate limits: passed')
  } finally {
    // IDs are only those generated within this run. Never truncates shared tables.
    if(ids.length){await pool.query('DELETE FROM forum_moderation WHERE actor_id=ANY($1::text[])',[ids]);await pool.query('DELETE FROM forum_replies WHERE author_id=ANY($1::text[])',[ids]);await pool.query('DELETE FROM forum_posts WHERE author_id=ANY($1::text[])',[ids]);await pool.query('DELETE FROM "user" WHERE id=ANY($1::text[])',[ids])}
    await pool.end()
  }
}
main().catch((error)=>{console.error('Forum integration failed:',error instanceof Error?error.message:'Unknown error');process.exitCode=1})
