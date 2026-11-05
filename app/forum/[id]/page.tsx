import { ThreadView } from '../ForumUI'
export const metadata = {title:'江湖討論 · JHDB',robots:{index:false,follow:true}}
export default async function ThreadPage({params}:{params:Promise<{id:string}>}) { return <ThreadView id={(await params).id}/> }
