'use client'

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { createIdentityStore, isCommunityPath, type Identity, type IdentitySnapshot } from '@/lib/forum/identity-store'

type IdentityResource = IdentitySnapshot & { refresh: () => void; replace: (data: Identity) => void }
const IdentityContext = createContext<IdentityResource | null>(null)

async function fetchIdentity(signal: AbortSignal): Promise<Identity> {
  const response = await fetch('/api/forum/me', { credentials: 'same-origin', cache: 'no-store', signal })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || '未能確認登入狀態，請重新嘗試。')
  return data as Identity
}

// Lives in the root layout, not individual forum/account pages: navigation never
// discards a known identity. First load, stale navigation/focus, or an explicit
// refresh may revalidate; there is deliberately no polling interval.
export function CommunityIdentityProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/'
  const enabled = isCommunityPath(pathname)
  const [store] = useState(() => createIdentityStore(fetchIdentity))
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
  const refresh = useCallback(() => { void store.load(true) }, [store])
  useEffect(() => { if (enabled) void store.load() }, [enabled, pathname, store])
  useEffect(() => {
    if (!enabled) return
    const revalidate = () => { if (document.visibilityState === 'visible') void store.load() }
    window.addEventListener('focus', revalidate)
    document.addEventListener('visibilitychange', revalidate)
    return () => {
      window.removeEventListener('focus', revalidate)
      document.removeEventListener('visibilitychange', revalidate)
    }
  }, [enabled, store])
  return <IdentityContext.Provider value={{ ...state, refresh, replace: store.replace }}>{children}</IdentityContext.Provider>
}

export function useIdentity() {
  const identity = useContext(IdentityContext)
  if (!identity) throw new Error('Forum identity provider missing')
  return identity
}
