import { currentMember, requireMember } from '@/lib/forum/session'
import { googleLoginReady } from '@/lib/auth'
import { saveProfile } from '@/lib/forum/repository'
import { jsonInput,respond,sameOrigin } from '@/lib/forum/http'
export const dynamic='force-dynamic'
export const runtime='nodejs'
export async function GET(request:Request) { return respond(async()=>({member:await currentMember(request.headers),googleReady:googleLoginReady()})) }
export async function PATCH(request:Request) { return respond(async()=>{sameOrigin(request);return saveProfile(await requireMember(request.headers),await jsonInput(request))}) }
