import { requireMember } from '@/lib/forum/session'
import { changeReply } from '@/lib/forum/repository'
import { jsonInput,respond,sameOrigin } from '@/lib/forum/http'
export const runtime='nodejs'
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) { return respond(async()=>{sameOrigin(request);return changeReply(await requireMember(request.headers),(await params).id,await jsonInput(request))}) }
