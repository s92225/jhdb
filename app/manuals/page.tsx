// app/manuals/page.tsx
import manuals from '@/data/manuals.json'
import { getSkills } from '@/lib/data'
import type { Manual, Skill } from '@/lib/types'
import { ManualCard } from './ui'
import { CategoryTabs, type CategorizedItem } from '@/app/components/CategoryTabs'

const ANRAN_STEPS: Array<{ loc: string; npc: string; text: string }> = [
  { loc: '峨嵋', npc: '郭襄', text: '詢問《楊過》，會回饋「我也找許久了」' },
  { loc: '成都', npc: '—', text: '傳送至成都後往大漠方向前進' },
  { loc: '大漠 · 轉生之地', npc: '十大強者', text: '進入轉生之地找到《十大強者》' },
  { loc: '大漠 · 轉生之地', npc: '十大強者', text: '詢問《楊過》後退出' },
  { loc: '峨嵋', npc: '郭襄', text: '回報《楊過下落》' },
  { loc: '峨嵋', npc: '郭襄', text: '取得《黯然銷魂掌》秘笈' },
]

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

      <section id="anran" className="mt-8 space-y-4 scroll-mt-24 rounded-2xl border border-hairline bg-canvas p-5">
        <div>
          <h2 className="text-xl font-bold text-ink">黯然銷魂掌取得</h2>
          <p className="mt-2 max-w-3xl text-sm text-bodytext">
            需要完成峨嵋與大漠之間的多段對話任務，最終由郭襄交付秘笈。
          </p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {ANRAN_STEPS.map((s, i) => (
            <li key={i} className="flex gap-4 rounded-2xl border border-hairline bg-canvas p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rausch text-sm font-bold text-white">
                {i + 1}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-surface-strong px-2 py-0.5 font-medium text-ink">
                    {s.loc}
                  </span>
                  <span className="text-muted">NPC：{s.npc}</span>
                </div>
                <div className="mt-2 text-sm text-bodytext">{s.text}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6">
        <CategoryTabs
          searchPlaceholder="搜尋秘笈名稱、取得方式…"
          items={ms.map((m, idx) => {
            const name = norm((m as any)?.name ?? '')
            const skillId = name ? skillNameToId.get(name) : undefined
            const skillHref = skillId ? `/skills/${encodeURIComponent(skillId)}` : undefined
            const source = ((m as any)?.sourceFile ?? '其他') as string
            const it: CategorizedItem = {
              id: String((m as any)?.id ?? idx),
              category: source.includes('update') ? source.replace('.txt', '') : (source || '其他'),
              searchText: [name, (m as any)?.obtain, (m as any)?.learnRequirementsText, (m as any)?.rawExcerpt].filter(Boolean).join(' '),
              node: (
                <ManualCard
                  manual={m}
                  defaultExpanded={false}
                  skillHref={skillHref}
                />
              ),
            }
            return it
          })}
        />
      </div>
    </div>
  )
}
