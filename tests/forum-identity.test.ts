import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createIdentityStore, isCommunityPath, type Identity } from '../lib/forum/identity-store'
import { readGoogleProfile } from '../lib/forum/member-profile'

const member: Identity = { member: { id: 'member-123', displayName: '同道', gameId: '', isAdmin: true }, googleReady: true }
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

test('concurrent consumers and rapid route changes share a single identity request', async () => {
  let time = 100
  let calls = 0
  const result = deferred<Identity>()
  const store = createIdentityStore(() => { calls += 1; return result.promise }, { now: () => time })
  const first = store.load()
  const second = store.load()
  assert.equal(first, second)
  result.resolve(member)
  await first
  assert.equal(calls, 1)
  for (const path of ['/forum', '/account', '/forum/new', '/forum/admin']) {
    assert.equal(isCommunityPath(path), true)
    await store.load()
  }
  assert.equal(calls, 1)
  assert.equal(store.getSnapshot().data?.member?.id, member.member?.id)
  time += 60_001
  await store.load()
  assert.equal(calls, 2)
})

test('background revalidation retains the known member without a blank loading screen', async () => {
  const result = deferred<Identity>()
  const store = createIdentityStore(() => result.promise)
  store.replace(member)
  const refresh = store.load(true)
  assert.equal(store.getSnapshot().loading, true)
  assert.equal(store.getSnapshot().data, member)
  result.resolve({ ...member, member: { ...member.member!, gameId: 'new_ID' } })
  await refresh
  assert.equal(store.getSnapshot().data?.member?.gameId, 'new_ID')
  assert.equal(store.getSnapshot().loading, false)
})

test('logout and profile updates win against a late, stale request', async () => {
  const result = deferred<Identity>()
  const store = createIdentityStore(() => result.promise)
  store.replace(member)
  const oldRequest = store.load(true)
  store.replace({ member: null, googleReady: true })
  result.resolve(member)
  await oldRequest
  assert.equal(store.getSnapshot().data?.member, null)
  assert.equal(store.getSnapshot().loading, false)
  store.replace({ ...member, member: { ...member.member!, displayName: '新名號' } })
  await store.load()
  assert.equal(store.getSnapshot().data?.member?.displayName, '新名號')
})

test('network failure and timeout stop loading, fail closed, and allow retry', async () => {
  let mode = 'timeout'
  const store = createIdentityStore(() => {
    if (mode === 'timeout') return new Promise<Identity>(() => {})
    if (mode === 'error') return Promise.reject(new Error('offline'))
    return Promise.resolve(member)
  }, { timeout: 10 })
  store.replace(member)
  await store.load(true)
  assert.equal(store.getSnapshot().loading, false)
  assert.equal(store.getSnapshot().data, null)
  assert.match(store.getSnapshot().error, /逾時/)
  mode = 'error'
  await store.load(true)
  assert.equal(store.getSnapshot().error, 'offline')
  mode = 'success'
  await store.load(true)
  assert.equal(store.getSnapshot().data, member)
  assert.equal(store.getSnapshot().error, '')
})

test('identity is per provider, not shared across users or SSR renders', async () => {
  const a = createIdentityStore(async () => member)
  const b = createIdentityStore(async () => ({ member: null, googleReady: true }))
  await a.load()
  assert.equal(b.getSnapshot().data, null)
  assert.equal(a.getServerSnapshot().data, null)
  assert.equal(isCommunityPath('/skills'), false)
  assert.equal(isCommunityPath('/forum-unrelated'), false)
})

test('existing linked members use one read and never a redundant profile INSERT', async () => {
  let queries = 0
  const profile = await readGoogleProfile('member-123', async (sql, values) => {
    queries += 1
    assert.match(sql, /FROM account a LEFT JOIN forum_profiles/)
    assert.match(sql, /"providerId"=\$2/)
    assert.deepEqual(values, ['member-123', 'google'])
    return { rows: [{ displayName: '原有名號', gameId: 'real_ID' }] }
  })
  assert.equal(queries, 1)
  assert.deepEqual(profile, { displayName: '原有名號', gameId: 'real_ID' })
})

test('unlinked users fail closed; first-use initialization preserves concurrent profile changes', async () => {
  let queries = 0
  assert.equal(await readGoogleProfile('unlinked', async () => { queries += 1; return { rows: [] } }), null)
  assert.equal(queries, 1)
  const sql: string[] = []
  const profile = await readGoogleProfile('member-123', async (statement) => {
    sql.push(statement)
    if (sql.length === 1) return { rows: [{ displayName: null, gameId: null }] }
    if (sql.length === 2) return { rows: [] }
    return { rows: [{ displayName: '另一請求已儲存', gameId: 'real_ID' }] }
  })
  assert.equal(sql.length, 3)
  assert.match(sql[1], /ON CONFLICT \(user_id\) DO NOTHING/)
  assert.equal(profile?.displayName, '另一請求已儲存')
})

test('server session and verified email checks remain authoritative and uncached', () => {
  const session = readFileSync('lib/forum/session.ts', 'utf8')
  assert.match(session, /getAuth\(\)\.api\.getSession\(\{ headers \}\)/)
  assert.match(session, /!session\.user\.emailVerified/)
  assert.match(session, /isAdminEmail\(session\.user\.email,session\.user\.emailVerified\)/)
  assert.doesNotMatch(readFileSync('lib/auth.ts', 'utf8'), /cookieCache/)
  assert.deepEqual(JSON.parse(readFileSync('vercel.json', 'utf8')).regions, ['sin1'])
  assert.match(readFileSync('app/components/LayoutShell.tsx', 'utf8'), /CommunityIdentityProvider/)
  assert.doesNotMatch(readFileSync('app/forum/CommunityIdentity.tsx', 'utf8'), /setInterval|localStorage|sessionStorage/)
})
