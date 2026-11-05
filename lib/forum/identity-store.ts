export type Member = { id: string; displayName: string; gameId: string; isAdmin: boolean }
export type Identity = { member: Member | null; googleReady: boolean }
export type IdentitySnapshot = { data: Identity | null; error: string; loading: boolean }

// Per-provider, memory-only UI state. Never used to authorize a server request.
// No cookies, tokens or member data are written to browser storage.
export function createIdentityStore(
  request: (signal: AbortSignal) => Promise<Identity>,
  { now = Date.now, staleAfter = 60_000, timeout = 12_000 } = {},
) {
  const initial: IdentitySnapshot = { data: null, error: '', loading: true }
  let snapshot = initial
  let updatedAt = 0
  let generation = 0
  let pending: Promise<void> | undefined
  let active: AbortController | undefined
  const listeners = new Set<() => void>()
  function publish(next: IdentitySnapshot) { snapshot = next; listeners.forEach((listener) => listener()) }
  function replace(data: Identity) {
    generation += 1
    active?.abort()
    active = undefined
    pending = undefined
    updatedAt = now()
    publish({ data, error: '', loading: false })
  }
  function load(force = false): Promise<void> {
    if (pending) return pending
    if (!force && snapshot.data && now() - updatedAt < staleAfter) return Promise.resolve()
    const version = generation
    const controller = new AbortController()
    active = controller
    publish({ ...snapshot, error: '', loading: true })
    let timer: ReturnType<typeof setTimeout>
    const deadline = new Promise<never>((_, reject) => {
      controller.signal.addEventListener('abort', () => reject(new Error('登入狀態檢查已取消。')), { once: true })
      timer = setTimeout(() => {
        reject(new Error('登入狀態確認逾時，請重新嘗試。'))
        controller.abort()
      }, timeout)
    })
    const task = Promise.race([Promise.resolve().then(() => request(controller.signal)), deadline])
      .then((data) => {
        if (version !== generation) return
        updatedAt = now()
        publish({ data, error: '', loading: false })
      })
      .catch((error: unknown) => {
        if (version !== generation) return
        // Failed verification must not leave privileged UI appearing confirmed.
        publish({ data: null, error: error instanceof Error ? error.message : '未能確認登入狀態，請重新嘗試。', loading: false })
      })
      .finally(() => {
        clearTimeout(timer)
        if (pending === task) { pending = undefined; active = undefined }
      })
    pending = task
    return task
  }
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initial,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    load,
    replace,
  }
}

export function isCommunityPath(path: string) {
  return path === '/account' || path === '/forum' || path.startsWith('/forum/')
}
