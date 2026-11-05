import { getAllUpdates } from '@/lib/data'
import { UpdateLog } from './UpdateLog'
import type { Metadata } from 'next'
import { ReferenceHeading } from '@/app/components/ReferenceHeading'

export const metadata: Metadata = { title: '江湖更新簿｜JHDB' }

export default function UpdatesPage() {
  const updates = getAllUpdates()
  return <div className="space-y-8"><ReferenceHeading title="江湖更新簿" description={<><p>按日期倒序整理遊戲公告與網站更新。最新核對：2026 年 10 月 31 日。</p><p className="mt-2">歷史公告保留當時規則；現行規則請以較新的公告為準。遊戲與網站更新分開標示。</p></>} /><UpdateLog updates={updates} /></div>
}
