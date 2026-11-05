import { ReferenceHeading } from '@/app/components/ReferenceHeading'
import { getAllSkills } from '@/lib/data'
import { SkillTable } from './table'

export default async function SkillsPage({ searchParams }: { searchParams?: Promise<{ source?: string }> }) {
  const skills = getAllSkills()
  const source = (await searchParams)?.source
  const initialFamily = typeof source === 'string' ? source : undefined

  return (
    <div className="skills-page space-y-4">
      <ReferenceHeading title="武技比較" description={<p>搜尋、篩選及多選比較。缺資料留白。</p>} />

      <SkillTable skills={skills} initialFamily={initialFamily} />
    </div>
  )
}
