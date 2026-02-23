import Link from 'next/link'
import { getAllSkills } from '@/lib/data'
import { SkillTable } from './table'

export default function SkillsPage({ searchParams }: { searchParams?: { source?: string } }) {
  const skills = getAllSkills()
  const initialFamily = typeof searchParams?.source === 'string' ? searchParams.source : undefined

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">武技比較</h1>
          <p className="mt-1 text-sm text-zinc-700">支援篩選、排序、與多選比較。缺資料欄位會保持空白。</p>
        </div>
      </div>

      <SkillTable skills={skills} initialFamily={initialFamily} />
    </div>
  )
}
