import { getAuth, googleLoginReady } from '@/lib/auth'
import { getPool } from '@/lib/db'
import { ForumError, isAdminEmail } from './validation'
import { readGoogleProfile } from './member-profile'

export type Actor = { id: string; isAdmin: boolean }
export async function currentMember(headers: Headers) {
  const session = await getAuth().api.getSession({ headers })
  if (!session?.user || !session.user.emailVerified) return null
  // A verified, linked Google identity is required even if auth settings change later.
  const profile = await readGoogleProfile(session.user.id, (sql, values) => getPool().query(sql, values))
  if (!profile) return null
  const actor: Actor = { id: session.user.id, isAdmin: isAdminEmail(session.user.email,session.user.emailVerified) }
  return { ...actor, ...profile, googleReady: googleLoginReady() }
}
export async function requireMember(headers: Headers): Promise<Actor> {
  const actor = await currentMember(headers)
  if (!actor) throw new ForumError(401,'請先用 Google 登入，再參與討論。')
  return actor
}
