// app/manuals/page.tsx
import manuals from '@/data/manuals.json'
import { getSkills } from '@/lib/data'
import type { Manual, Skill } from '@/lib/types'
import { ManualCard } from './ui'

function norm(s: string) {
  return (s ?? '').replace(/\u3000/g, ' ').replace(/\s+/g, ' ').trim()
}

function buildSkillNameMap(skills: Skill[]) {
  const map = new Map<string, string>()
  for (const s of skills) {
    const name = norm((s as any)?.name ?? '')
    const id = norm((s as any)?.id ?? '')
    if (!name || !id) continue
    if (!map.has(name)) map.set(name, id)
  }
  return map
}

export default async function ManualsPage() {
  const ms = manuals as Manual[]
  const skills = (await getSkills()) as Skill[]
  const skillNameToId = buildSkillNameMap(skills)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">武功秘笈</h1>
      <p className="mt-2 text-sm text-gray-600">整理版：優先顯示門檻與取得線索，來源可展開追溯。</p>

      <div className="mt-6 space-y-4">
        {ms.map((m, idx) => {
          const name = norm((m as any)?.name ?? '')
          const skillId = name ? skillNameToId.get(name) : undefined
          const skillHref = skillId ? `/skills/${encodeURIComponent(skillId)}` : undefined

          return (
            <ManualCard
              key={(m as any)?.id ?? idx}
              manual={m}
              defaultExpanded={idx < 2}
              skillHref={skillHref}
            />
          )
        })}
      </div>
    </div>
  )
}
