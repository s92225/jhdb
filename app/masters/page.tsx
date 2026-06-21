import type { Metadata } from 'next'
import { getAllMasters } from '@/lib/data'
import type { Master, MasterSkill } from '@/lib/types'
import { Badge } from '@/app/components/Badge'

export const metadata: Metadata = {
  title: '師傅所在地與給物條件｜人在江湖資料庫',
  description: '各門派師傅位置、可傳授技能及給物條件一覽。',
}

function ConditionTag({ label, value }: { label: string; value?: number | null }) {
  if (value == null) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-surface-soft px-1.5 py-0.5 text-xs text-muted">
      {label} <span className="font-semibold text-ink tabular-nums">{value}</span>
    </span>
  )
}

function SkillRow({ skill }: { skill: MasterSkill }) {
  const hasConditions =
    skill.readWrite != null ||
    skill.sectNeigong != null ||
    skill.basicQinggong != null ||
    skill.basicSword != null

  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="text-sm text-ink">{skill.name}</span>
        {hasConditions && (
          <div className="flex flex-wrap gap-1">
            <ConditionTag label="讀書寫字" value={skill.readWrite} />
            <ConditionTag label="本門內功" value={skill.sectNeigong} />
            <ConditionTag label="基本輕功" value={skill.basicQinggong} />
            <ConditionTag label="基本劍法" value={skill.basicSword} />
          </div>
        )}
      </div>
      {skill.skillLevel != null && (
        <span className="shrink-0 rounded-full bg-rausch/10 px-2 py-0.5 tabular-nums text-xs font-bold text-rausch">
          Lv.{skill.skillLevel}
        </span>
      )}
    </div>
  )
}

function MasterCard({ master }: { master: Master }) {
  return (
    <div className="rounded-2xl border border-hairline bg-canvas p-4 transition-shadow hover:shadow-airbnb">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-ink">{master.name}</div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <span aria-hidden>📍</span>
            {master.location}
          </div>
        </div>
        <Badge className="shrink-0 border-none bg-surface-soft text-xs font-medium text-muted">
          {master.sect}
        </Badge>
      </div>
      {master.skills.length > 0 && (
        <div className="mt-3 divide-y divide-hairline-soft">
          {master.skills.map((s) => (
            <SkillRow key={s.name} skill={s} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MastersPage() {
  const masters = getAllMasters()
  const sects = Array.from(new Set(masters.map((m) => m.sect)))
  const totalSkills = masters.reduce((sum, m) => sum + m.skills.length, 0)

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-ink">師傅所在地與給物條件</h1>
        <p className="text-sm text-muted">
          數值為需達到的技能等級才可獲得秘笈。額外條件以標籤顯示。
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="border-none bg-surface-soft font-medium text-bodytext">
            {masters.length} 位師傅
          </Badge>
          <Badge className="border-none bg-surface-soft font-medium text-bodytext">
            {totalSkills} 項技能
          </Badge>
        </div>
      </header>

      {sects.map((sect) => {
        const sectMasters = masters.filter((m) => m.sect === sect)
        return (
          <section key={sect}>
            <h2 className="mb-3 text-lg font-bold text-ink">{sect}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {sectMasters.map((m) => (
                <MasterCard key={m.id} master={m} />
              ))}
            </div>
          </section>
        )
      })}

      <p className="text-xs text-muted-soft">
        資料來源：師傅所在地與給物條件.pdf
      </p>
    </div>
  )
}
