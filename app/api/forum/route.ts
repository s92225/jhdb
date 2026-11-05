import { currentMember, requireMember } from '@/lib/forum/session'
import { listThreads, createThread } from '@/lib/forum/repository'
import { jsonInput, respond, sameOrigin } from '@/lib/forum/http'
export const dynamic='force-dynamic'
export const runtime='nodejs'
export async function GET(request:Request) {
  return respond(async()=>{const p=new URL(request.url).searchParams;return listThreads({q:p.get('q')||'',category:p.get('category')||'',page:Number(p.get('page'))||1,sort:p.get('sort')||'',hidden:p.get('hidden')==='true'},p.get('hidden')==='true'?await currentMember(request.headers):null)})
}
export async function POST(request:Request) { return respond(async()=>{sameOrigin(request);const actor=await requireMember(request.headers);return createThread(actor,await jsonInput(request))}) }
