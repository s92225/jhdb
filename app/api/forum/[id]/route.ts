import { currentMember, requireMember } from '@/lib/forum/session'
import { threadDetail,changeThread } from '@/lib/forum/repository'
import { jsonInput,respond,sameOrigin } from '@/lib/forum/http'
export const dynamic='force-dynamic'
export const runtime='nodejs'
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) { return respond(async()=>threadDetail((await params).id,await currentMember(request.headers),Number(new URL(request.url).searchParams.get('page'))||1)) }
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) { return respond(async()=>{sameOrigin(request);return changeThread(await requireMember(request.headers),(await params).id,await jsonInput(request))}) }
