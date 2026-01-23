import Link from 'next/link'
import { getAllSkills } from '@/lib/data'
import { SkillTable } from './table'

export default function SkillsPage() {
  const skills = getAllSkills()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">武技比較</h1>
          <p className="mt-1 text-sm text-zinc-700">支援篩選、排序、與多選比較。缺資料欄位會保持空白。</p>
        </div>
        <Link href="/skills/compare" className="rounded-xl border bg-white px-4 py-2 text-sm shadow-sm">
          進入比較頁
        </Link>
      </div>

      <SkillTable skills={skills} />
    </div>
  )
}
