import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { getPool } from './db'

export function googleLoginReady() { return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.BETTER_AUTH_SECRET) }

let instance: ReturnType<typeof createAuth> | undefined
function createAuth() {
  if (!process.env.BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET is not configured')
  if (!process.env.BETTER_AUTH_URL) throw new Error('BETTER_AUTH_URL is not configured')
  return betterAuth({
    appName: '人在江湖資料庫',
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: getPool(),
    emailAndPassword: { enabled: false },
    socialProviders: googleLoginReady() ? { google: {
      clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: 'select_account', accessType: 'online', includeGrantedScopes: false,
    } } : {},
    account: { accountLinking: { enabled: false }, encryptOAuthTokens: true, storeAccountCookie: false },
    advanced: { cookiePrefix: 'jhdb' },
    user: { changeEmail: { enabled: false } },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 40 },
    plugins: [nextCookies()],
  })
}

export function getAuth() { return instance ??= createAuth() }
