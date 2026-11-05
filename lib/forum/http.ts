import { NextResponse } from 'next/server'
import { ForumError } from './validation'

export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const allowed = new Set([new URL(request.url).origin, ...(process.env.BETTER_AUTH_URL ? [new URL(process.env.BETTER_AUTH_URL).origin] : [])])
  if (!origin || !allowed.has(origin) || request.headers.get('sec-fetch-site') === 'cross-site') throw new ForumError(403,'請從 JHDB 網站提交操作。')
}
export async function jsonInput(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new ForumError(415,'只接受 JSON 格式。')
  const reader = request.body?.getReader()
  if (!reader) throw new ForumError(400,'提交內容為空。')
  let size = 0; const chunks: Uint8Array[] = []
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 65536) { await reader.cancel(); throw new ForumError(413,'提交內容過長。') } chunks.push(value) }
  try {
    const raw = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error()
    return raw as Record<string,unknown>
  } catch { throw new ForumError(400,'提交內容格式不正確。') }
}
export async function respond(work: () => Promise<unknown>) {
  try { return NextResponse.json(await work(), { headers: { 'Cache-Control':'private, no-store' } }) }
  catch (error) {
    if (error instanceof ForumError) return NextResponse.json({ error: error.message },{ status: error.status,headers:{'Cache-Control':'private, no-store'} })
    // Do not log query parameters, tokens, connection strings or user content.
    console.error('Forum request failed', { name: error instanceof Error ? error.name : 'UnknownError' })
    return NextResponse.json({ error:'討論區暫時未能連線，請稍後再試。' },{ status:503,headers:{'Cache-Control':'private, no-store'} })
  }
}
