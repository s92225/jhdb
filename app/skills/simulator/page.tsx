import type { Metadata } from 'next'
import { getSkills } from '@/lib/data'
import { EffectSimulator } from '@/app/components/EffectSimulator'

export const metadata: Metadata = {
  title: '特效效果模擬器｜人在江湖資料庫',
  description: '武技連擊、兵器加成、暗勁/毒性/寒毒疊層與組合技能效果模擬。',
}

export default async function EffectSimulatorPage() {
  const skills = (await getSkills()) as any[]

  const skillsLite = skills.map((s) => ({
    id: String(s?.id ?? ''),
    name: String(s?.name ?? ''),
    sect: (s?.sect ?? s?.sourceTag ?? null) as string | null,
    tier: (s?.tier ?? null) as string | null,
    configs: Array.isArray(s?.configs) ? (s.configs as string[]) : [],
    avgNeishang:
      (s?.averages?.neishang ?? s?.averages?.inner ?? null) as number | null,
    avgBishang:
      (s?.averages?.bishang ?? s?.averages?.arm ?? null) as number | null,
    combo: (() => {
      const c = Array.isArray(s?.specialEffects)
        ? s.specialEffects.find((e: any) => e?.type === '連擊進攻')
        : null
      if (!c) return null
      return {
        triggerChance: Number(c.triggerChance ?? 0),
        hitCount: Number(c.hitCount ?? 0),
        multMin: Number(c.damageMultiplierMin ?? 1),
        multMax: Number(c.damageMultiplierMax ?? 1),
        description: String(c.description ?? '連擊進攻'),
      }
    })(),
    weaponBonus: (() => {
      const wb = Array.isArray(s?.weaponBonus) ? s.weaponBonus[0] : null
      if (!wb) return null
      return {
        weaponName: String(wb.weaponName ?? ''),
        minPct: Number(wb.bonusPercentMin ?? 0),
        maxPct: Number(wb.bonusPercentMax ?? 0),
        description: String(wb.description ?? ''),
      }
    })(),
    comboSkill: s?.comboSkill
      ? {
          partner: String(s.comboSkill.partner ?? ''),
          partnerType: String(s.comboSkill.partnerType ?? ''),
          level: Number(s.comboSkill.level ?? 0),
          bonus: Number(s.comboSkill.bonus ?? 0),
        }
      : null,
    stack: (() => {
      const st = Array.isArray(s?.specialEffects)
        ? s.specialEffects.find((e: any) =>
            ['暗勁', '毒性', '寒毒'].includes(e?.type),
          )
        : null
      if (!st) return null
      return {
        type: String(st.type),
        effectName: String(st.effectName ?? ''),
        triggerChance: Number(st.triggerChance ?? 0),
        maxStacks: Number(st.maxStacks ?? 0),
        hpPerStack: Number(st.hpPerStack ?? 0),
        spiritPerStack: Number(st.spiritPerStack ?? 0),
        description: String(st.description ?? ''),
      }
    })(),
  }))

  return (
    <div className="space-y-6">
      <header>
        <span className="pill">攻略圖解 · Effect Simulator</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          特效效果模擬器
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-bodytext">
          選擇武技與五行對位，模擬器自動套用該武技的
          <span className="font-semibold text-ink">連擊進攻</span>、
          <span className="font-semibold text-ink">兵器加成</span>、
          <span className="font-semibold text-ink">暗勁／毒性／寒毒疊層</span>
          與
          <span className="font-semibold text-ink">組合技能</span>
          效果，並估算每回合直傷與 DoT。
        </p>
      </header>
      <EffectSimulator skills={skillsLite as any} />
    </div>
  )
}
