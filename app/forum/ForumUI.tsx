'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, MessageSquare, Plus, Search, Pin, LockKeyhole } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { CATEGORIES, categoryLabel } from '@/lib/forum/validation'
import type { Thread, Reply } from '@/lib/forum/repository'
import type { Member } from '@/lib/forum/identity-store'
import { useIdentity } from './CommunityIdentity'

type Resource<T> = { data: T | null; error: string; loading: boolean; refresh: () => void }

async function api<T>(path: string, method='GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { method, credentials: 'same-origin', cache: 'no-store', signal,
    ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || '未能完成操作，請稍後再試。')
  return data as T
}
function useResource<T>(path: string | null): Resource<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [revision, setRevision] = useState(0)
  const refresh = useCallback(() => setRevision((n) => n+1), [])
  useEffect(() => {
    if (!path) { setLoading(false); return }
    const controller = new AbortController()
    setLoading(true); setError(''); setData(null)
    api<T>(path, 'GET', undefined, controller.signal).then(setData).catch((e: Error) => {
      if (e.name !== 'AbortError') setError(e.message)
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [path,revision])
  return { data, error, loading, refresh }
}
function ErrorMessage({ message, retry }: { message: string; retry?: () => void }) {
  return message ? <div className="forum-error" role="alert"><p>{message}</p>{retry && <button className="forum-text-button" onClick={retry}>重新嘗試</button>}</div> : null
}
function date(value: string) {
  return new Intl.DateTimeFormat('zh-HK', { timeZone: 'Asia/Hong_Kong', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}
function Author({ person }: { person: { displayName: string; gameId: string } }) {
  return <span className="forum-author"><strong>{person.displayName}</strong>{person.gameId && <span>遊戲 ID：{person.gameId} <span className="forum-self-declared">（自填）</span></span>}</span>
}
function Badges({ post }: { post: Thread }) {
  return <>{post.hidden && <span className="forum-badge forum-badge-hidden">已隱藏</span>}{post.pinned && <span className="forum-badge"><Pin size={12} aria-hidden="true" />置頂</span>}{post.locked && <span className="forum-badge"><LockKeyhole size={12} aria-hidden="true" />已鎖定</span>}</>
}

export function CommunityFrame({ children }: { children: ReactNode }) {
  const identity = useIdentity()
  const pathname = usePathname()
  return <div className="community-grid">
    <aside className="community-sidebar" aria-label="討論區導覽">
      <Link className="community-name" href="/forum">人在江湖資料庫</Link><p className="forum-muted">JHDB · 玩家討論區</p>
      <nav><Link href="/forum" aria-current={pathname === '/forum' ? 'page' : undefined}>所有討論</Link><Link href="/forum/new" aria-current={pathname === '/forum/new' ? 'page' : undefined}>發表主題</Link><Link href="/account" aria-current={pathname === '/account' ? 'page' : undefined}>會員設定</Link>{identity.data?.member?.isAdmin && <Link href="/forum/admin" aria-current={pathname === '/forum/admin' ? 'page' : undefined}>版務管理</Link>}</nav>
      <div className="community-sidebar-note"><p>以武會友，以理交流。</p><p>遊戲 ID 為玩家自行填寫，並非已驗證身份。請勿公開個人資料或交易密碼。</p><Link href="/forum/rules">社群守則與私隱</Link></div>
    </aside>
    <div className="community-canvas">{children}</div>
  </div>
}

export function LoginPanel({ compact=false }: { compact?: boolean }) {
  const { data, loading, error, refresh } = useIdentity()
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState('')
  const pathname = usePathname()
  async function login() {
    setBusy(true); setFailure('')
    try {
      const result = await authClient.signIn.social({ provider: 'google', callbackURL: pathname || '/forum', errorCallbackURL: '/account?authError=1' })
      if (result.error) throw new Error('Google 登入未能完成，請稍後再試。')
    } catch (e) { setFailure(e instanceof Error ? e.message : '登入失敗。'); setBusy(false) }
  }
  if (loading && !data) return <p className="forum-muted" role="status">正在確認登入狀態…</p>
  if (error) return <ErrorMessage message={error} retry={refresh} />
  if (data?.member) return <div className="forum-member-strip"><Author person={data.member} /><Link href="/account">會員設定{data.member.isAdmin ? ' · 管理員' : ''}</Link></div>
  return <div className={`forum-login ${compact ? 'forum-login-compact' : ''}`}>
    <div><h2>與同道交流</h2><p>用 Google 登入後，即可發問與回覆。電郵不會公開顯示。</p></div>
    <button className="forum-button" type="button" disabled={!data?.googleReady || busy} onClick={login}>{busy ? '正在前往 Google…' : data?.googleReady ? '使用 Google 登入' : 'Google 登入尚未開通'}</button>
    {!data?.googleReady && <p className="forum-muted forum-login-notice">管理員正在完成 Google 登入設定；目前仍可瀏覽討論。</p>}
    <ErrorMessage message={failure} />
  </div>
}

type ListResult = { posts: Thread[]; total: number; page: number; pageSize: number }
export function ForumList({ admin=false }: { admin?: boolean }) {
  const identity = useIdentity()
  const [category, setCategory] = useState('')
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recent')
  const [page, setPage] = useState(1)
  const authorized = !admin || Boolean(identity.data?.member?.isAdmin)
  const params = new URLSearchParams({ category, q: query, sort, page: String(page), ...(admin ? {hidden:'true'} : {}) })
  const resource = useResource<ListResult>(authorized ? `/api/forum?${params}` : null)
  function search(e: FormEvent) { e.preventDefault(); setQuery(draft); setPage(1) }
  return <>
    <div className="forum-title-row"><div><h1>{admin ? '版務管理' : '江湖討論'}</h1><p className="forum-muted">{admin ? '查看全部帖子，包括已隱藏的討論。版務操作會保留記錄。' : '查不到的線索，問問走過這條路的同道。'}</p></div>{!admin && <Link className="forum-button" href="/forum/new"><Plus size={16} aria-hidden="true" />發表主題</Link>}</div>
    {admin && identity.loading && !identity.data ? <p role="status">正在確認管理員權限…</p> : !authorized ? <><p className="forum-empty">此頁只限管理員使用，請以管理員 Google 帳戶登入。</p><LoginPanel /></> : <>
      <div className="forum-toolbar"><form onSubmit={search} role="search"><label className="sr-only" htmlFor="forum-search">搜尋討論</label><Search size={18} aria-hidden="true" /><input id="forum-search" type="search" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={100} placeholder="搜尋標題或內文" /><button type="submit" className="forum-secondary">搜尋</button></form><label className="forum-sort">排序<select value={sort} onChange={(e) => {setSort(e.target.value);setPage(1)}}><option value="recent">最近回覆</option><option value="newest">最新發表</option></select></label></div>
      <div className="forum-categories" aria-label="討論分類">{[{id:'',label:'全部'},...CATEGORIES].map((c) => <button type="button" key={c.id} aria-pressed={category===c.id} onClick={() => {setCategory(c.id);setPage(1)}}>{c.label}</button>)}</div>
      <div className="forum-list-heading"><span>{resource.data ? `${resource.data.total} 個討論${query ? ` · 「${query}」的搜尋結果` : ''}` : '討論主題'}</span><span>回覆</span></div>
      {resource.loading && <div className="forum-loading" role="status">正在載入討論…</div>}
      <ErrorMessage message={resource.error} retry={resource.refresh} />
      {resource.data && <><div className="forum-topic-list">{resource.data.posts.length ? resource.data.posts.map((post) => <article className="forum-topic" key={post.id}><div><div className="forum-topic-meta"><span>{categoryLabel(post.category)}</span><Badges post={post} /></div><h2><Link href={`/forum/${post.id}`}>{post.title}</Link></h2><div className="forum-topic-byline"><span>{post.displayName}</span><time dateTime={post.activityAt}>最後活動 {date(post.activityAt)}</time></div></div><span className="forum-reply-count"><MessageSquare size={15} aria-hidden="true" />{post.replyCount}<span className="sr-only"> 個回覆</span></span></article>) : <div className="forum-empty"><h2>{query || category ? '暫時沒有符合的討論' : '第一個江湖問題，由你開始。'}</h2><p>{query || category ? '試試其他關鍵字，或切換至全部分類。' : '問武學、找任務線索，或分享一路摸索的心得。'}</p>{query || category ? <button className="forum-text-button" onClick={() => {setDraft('');setQuery('');setCategory('');setPage(1)}}>清除篩選</button> : <Link className="forum-text-button" href="/forum/new">發表第一個主題 <ArrowRight size={16} aria-hidden="true" /></Link>}</div>}</div><Pagination page={page} total={resource.data.total} size={20} change={setPage} /></>}
      {!admin && <LoginPanel compact />}
    </>}
  </>
}
function Pagination({ page,total,size,change }: { page:number; total:number; size:number; change:(page:number)=>void }) {
  if (total<=size) return null
  return <nav className="forum-pagination" aria-label="分頁"><button className="forum-secondary" disabled={page<=1} onClick={()=>change(page-1)}>上一頁</button><span>{(page-1)*size+1}–{Math.min(page*size,total)} / {total}</span><button className="forum-secondary" disabled={page*size>=total} onClick={()=>change(page+1)}>下一頁</button></nav>
}

function PostFields({ value, change }: { value: {title:string;category:string;body:string}; change:(value:{title:string;category:string;body:string})=>void }) {
  return <><label className="forum-field">分類<select value={value.category} onChange={(e)=>change({...value,category:e.target.value})}>{CATEGORIES.map((c)=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label><label className="forum-field">標題<input required minLength={4} maxLength={100} value={value.title} onChange={(e)=>change({...value,title:e.target.value})} placeholder="例如：氣勢值會怎樣影響招架？" /><span className="forum-help">4–100 字，清楚寫出你遇到的問題。</span></label><label className="forum-field">內文<textarea required minLength={10} maxLength={12000} rows={9} value={value.body} onChange={(e)=>change({...value,body:e.target.value})} placeholder="可以補充門派、武學等級、已試過的方法及相關線索。" /><span className="forum-help">10–12,000 字。純文字發表，不支援 HTML 或圖片上傳。</span></label></>
}
export function NewThread() {
  const {data,loading} = useIdentity()
  const router = useRouter()
  const [form,setForm] = useState({ title:'',category:'questions',body:'' })
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  async function submit(e:FormEvent) {
    e.preventDefault();setBusy(true);setError('')
    try { const result=await api<{id:string}>('/api/forum','POST',form);router.push(`/forum/${result.id}`) }
    catch(e) {setError(e instanceof Error?e.message:'發表失敗。');setBusy(false)}
  }
  return <><Link className="forum-back" href="/forum"><ArrowLeft size={16} aria-hidden="true" />所有討論</Link><div className="forum-title-row"><div><h1>發表主題</h1><p className="forum-muted">一個清楚的問題，讓同道更容易幫到你。</p></div></div>{loading && !data ? <p role="status">正在確認登入狀態…</p> : data?.member ? <form className="forum-editor" onSubmit={submit}><PostFields value={form} change={setForm} /><p className="forum-help">發表即表示同意<Link href="/forum/rules">社群守則與私隱說明</Link>。顯示名稱及遊戲 ID 會與帖子一同公開。</p><ErrorMessage message={error} /><div className="forum-form-actions"><Link className="forum-secondary" href="/forum">取消</Link><button className="forum-button" disabled={busy}>{busy?'正在發表…':'發表主題'}</button></div></form> : <LoginPanel />}</>
}

type DetailResult = {post:Thread;replies:Reply[];replyTotal:number;page:number;pageSize:number}
export function ThreadView({id}:{id:string}) {
  const identity=useIdentity()
  const member=identity.data?.member
  const [page,setPage]=useState(1)
  // Reload once membership resolves, so an admin sees hidden content too.
  const resource=useResource<DetailResult>(`/api/forum/${id}?page=${page}&membership=${member?.id || 'public'}`)
  const [body,setBody]=useState('')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [editing,setEditing]=useState(false)
  const [edit,setEdit]=useState({title:'',category:'questions',body:''})
  async function action(action:string,values?:unknown) {
    const post=resource.data?.post
    if(action==='hide' && !window.confirm(`隱藏「${post?.title}」？一般用戶將無法查看，管理員可稍後還原。`))return
    setBusy(true);setError('')
    try {await api(`/api/forum/${id}`,'PATCH', values || {action});setEditing(false);resource.refresh()}
    catch(e){setError(e instanceof Error?e.message:'操作失敗。')}finally{setBusy(false)}
  }
  async function reply(e:FormEvent) {
    e.preventDefault();setBusy(true);setError('')
    try {await api(`/api/forum/${id}/replies`,'POST',{body});setBody('');setPage(Math.max(1,Math.ceil(((resource.data?.replyTotal||0)+1)/50)));resource.refresh()}
    catch(e){setError(e instanceof Error?e.message:'回覆失敗。')}finally{setBusy(false)}
  }
  const post=resource.data?.post
  return <><Link className="forum-back" href="/forum"><ArrowLeft size={16} aria-hidden="true" />所有討論</Link>
    {resource.loading && <div className="forum-loading" role="status">正在載入討論…</div>}<ErrorMessage message={resource.error} retry={resource.refresh}/>
    {post && <><article className="forum-post"><div className="forum-topic-meta"><span>{categoryLabel(post.category)}</span><Badges post={post}/></div><h1>{post.title}</h1><div className="forum-post-byline"><Author person={post}/><time dateTime={post.createdAt}>{date(post.createdAt)}</time></div>
      {editing ? <form className="forum-editor" onSubmit={(e)=>{e.preventDefault();void action('edit',{action:'edit',...edit})}}><PostFields value={edit} change={setEdit}/><div className="forum-form-actions"><button type="button" className="forum-secondary" disabled={busy} onClick={()=>setEditing(false)}>取消</button><button className="forum-button" disabled={busy}>儲存修改</button></div></form> : <div className="forum-prose">{post.body}</div>}
      {post.updatedAt!==post.createdAt && <p className="forum-help">已編輯 · {date(post.updatedAt)}</p>}
      {member && (member.isAdmin || (member.id===post.authorId&&!post.locked&&!post.hidden)) && !editing && <button className="forum-text-button" onClick={()=>{setEdit({title:post.title,body:post.body,category:post.category});setEditing(true)}}>編輯帖子</button>}
      {member?.isAdmin && <div className="forum-moderation" aria-label="帖子版務操作"><span>版務</span>{[[post.pinned?'unpin':'pin',post.pinned?'取消置頂':'置頂'],[post.locked?'unlock':'lock',post.locked?'解除鎖定':'鎖定討論'],[post.hidden?'restore':'hide',post.hidden?'還原帖子':'隱藏帖子']].map(([key,label])=><button key={key} type="button" disabled={busy} className="forum-secondary" onClick={()=>void action(key)}>{label}</button>)}</div>}
    </article>
    <section className="forum-replies" aria-labelledby="replies-title"><h2 id="replies-title">{resource.data?.replyTotal} 個回覆{member?.isAdmin ? '（含隱藏）' : ''}</h2>{resource.data?.replies.length ? resource.data.replies.map((reply)=><ReplyRow key={reply.id} reply={reply} member={member} locked={post.locked||post.hidden} refresh={resource.refresh}/>) : <p className="forum-muted">暫時未有回覆。</p>}<Pagination page={page} total={resource.data?.replyTotal||0} size={50} change={setPage}/></section>
    <ErrorMessage message={error}/>
    {post.locked || post.hidden ? <p className="forum-notice">{post.hidden?'此帖子已隱藏。':'此討論已鎖定。'}目前不能新增回覆。</p> : member ? <form className="forum-reply-form" onSubmit={reply}><label className="forum-field">加入討論<textarea required minLength={2} maxLength={12000} rows={5} value={body} onChange={(e)=>setBody(e.target.value)} placeholder="分享你的線索，或補充更多問題。"/></label><div className="forum-form-actions"><span className="forum-help">以 {member.displayName} 發表 · 2–12,000 字</span><button className="forum-button" disabled={busy}>{busy?'正在提交…':'發表回覆'}</button></div></form> : <LoginPanel/>}
    </>}
  </>
}
function ReplyRow({reply,member,locked,refresh}:{reply:Reply;member:Member|null|undefined;locked:boolean;refresh:()=>void}) {
  const [editing,setEditing]=useState(false)
  const [body,setBody]=useState(reply.body)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  async function action(action:string) {
    if(action==='hide'&&!window.confirm(`隱藏 ${reply.displayName} 的回覆？管理員可稍後還原。`))return
    setBusy(true);setError('')
    try{await api(`/api/forum/replies/${reply.id}`,'PATCH',{action,body});setEditing(false);refresh()}
    catch(e){setError(e instanceof Error?e.message:'操作失敗。')}finally{setBusy(false)}
  }
  return <article className={`forum-reply ${reply.hidden?'forum-reply-hidden':''}`} id={`reply-${reply.id}`}><div className="forum-post-byline"><Author person={reply}/><time dateTime={reply.createdAt}>{date(reply.createdAt)}</time></div>{reply.hidden&&<span className="forum-badge forum-badge-hidden">已隱藏</span>}{editing?<form onSubmit={(e)=>{e.preventDefault();void action('edit')}}><label className="forum-field">編輯回覆<textarea required rows={5} minLength={2} maxLength={12000} value={body} onChange={(e)=>setBody(e.target.value)}/></label><div className="forum-form-actions"><button type="button" className="forum-secondary" onClick={()=>setEditing(false)}>取消</button><button className="forum-button" disabled={busy}>儲存修改</button></div></form>:<div className="forum-prose">{reply.body}</div>}{reply.updatedAt!==reply.createdAt&&<p className="forum-help">已編輯 · {date(reply.updatedAt)}</p>}<div className="forum-inline-actions">{member&&(member.isAdmin||(member.id===reply.authorId&&!locked&&!reply.hidden))&&!editing&&<button className="forum-text-button" onClick={()=>{setBody(reply.body);setEditing(true)}}>編輯</button>}{member?.isAdmin&&<button className="forum-text-button" disabled={busy} onClick={()=>void action(reply.hidden?'restore':'hide')}>{reply.hidden?'還原回覆':'隱藏回覆'}</button>}</div><ErrorMessage message={error}/></article>
}

export function AccountSettings() {
  const identity=useIdentity()
  const member=identity.data?.member
  const [form,setForm]=useState({displayName:'',gameId:''})
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [saved,setSaved]=useState(false)
  const [authError,setAuthError]=useState(false)
  useEffect(()=>{setAuthError(new URLSearchParams(window.location.search).has('authError'))},[])
  const memberId=member?.id, memberDisplayName=member?.displayName, memberGameId=member?.gameId
  useEffect(()=>{if(memberId)setForm({displayName:memberDisplayName??'',gameId:memberGameId??''})},[memberId,memberDisplayName,memberGameId])
  async function submit(e:FormEvent) {
    e.preventDefault();setBusy(true);setError('');setSaved(false)
    try{const result=await api<{displayName:string;gameId:string}>('/api/forum/me','PATCH',form);if(member)identity.replace({googleReady:identity.data?.googleReady??true,member:{...member,displayName:result.displayName,gameId:result.gameId}});setSaved(true)}catch(e){setError(e instanceof Error?e.message:'儲存失敗。')}finally{setBusy(false)}
  }
  async function logout() {
    setBusy(true);setError('')
    try{const result=await authClient.signOut();if(result.error)throw new Error('未能登出，請再試。');identity.replace({member:null,googleReady:identity.data?.googleReady??true})}catch(e){setError(e instanceof Error?e.message:'未能登出。')}finally{setBusy(false)}
  }
  return <><div className="forum-title-row"><div><h1>會員設定</h1><p className="forum-muted">管理你的江湖名號及遊戲 ID。</p></div></div>{authError&&<ErrorMessage message="Google 登入未完成。請重新登入；若仍然失敗，請聯絡管理員。"/>}{!member?<LoginPanel/>:<><div className="forum-settings-grid"><div><h2>公開身份</h2><p className="forum-muted">下列資料會顯示在你的帖子及回覆旁。Google 電郵不會公開。</p>{member.isAdmin&&<p className="forum-notice">管理員帳戶 · <Link href="/forum/admin">進入版務管理</Link></p>}</div><form className="forum-editor" onSubmit={submit}><label className="forum-field">顯示名稱<input required minLength={2} maxLength={30} autoComplete="nickname" value={form.displayName} onChange={(e)=>{setSaved(false);setForm({...form,displayName:e.target.value})}}/><span className="forum-help">2–30 字。首次登入不會自動公開 Google 姓名。</span></label><label className="forum-field">遊戲 ID <span className="forum-help">選填</span><input maxLength={32} value={form.gameId} onChange={(e)=>{setSaved(false);setForm({...form,gameId:e.target.value})}}/><span className="forum-help">最多 32 字；僅接受文字、數字、空格、底線及連字號。這是自填資料，並非遊戲帳戶認證。</span></label><div className="forum-profile-preview"><span className="forum-help">帖子旁的顯示方式</span><Author person={form}/></div><ErrorMessage message={error}/><div className="forum-form-actions"><span role="status">{saved?'設定已儲存。':''}</span><button className="forum-button" disabled={busy}>{busy?'正在儲存…':'儲存設定'}</button></div></form></div><div className="forum-session-row"><div><h2>登入工作階段</h2><p className="forum-muted">使用共用裝置後，請記得登出。</p></div><button type="button" className="forum-secondary" disabled={busy} onClick={()=>void logout()}>登出此裝置</button></div></>}</>
}
