export const INT = (n: number) => Math.trunc(n)

export type VitalStatsInput = {
  age: number
  intellect: number
  strength: number
  constitution: number
  currentMaxNeili: number
  currentMaxJingli: number
  taoismOrBuddhism: number
  extraMaxQi?: number
  extraMaxJing?: number
}

export type VitalStatsResult = {
  maxQi: number
  maxJing: number
  baseQi: number
  baseJing: number
  qiAgeGrowth: number
  jingAgeGrowth: number
  qiKnowledgeBonus: number
  jingKnowledgeBonus: number
  extraMaxQi: number
  extraMaxJing: number
}

export function calculateKnowledgeBonus(level: number) {
  if (level > 60) {
    return { qi: level * 10, jing: level * 6 }
  }

  if (level > 30) {
    return { qi: level * 6, jing: level * 4 }
  }

  return { qi: 0, jing: 0 }
}

export function calculateVitalStats({
  age,
  intellect,
  strength,
  constitution,
  currentMaxNeili,
  currentMaxJingli,
  taoismOrBuddhism,
  extraMaxQi = 0,
  extraMaxJing = 0,
}: VitalStatsInput): VitalStatsResult {
  // Current 寒江湖 observations show that 氣 gains eight points per
  // displayed 根骨/臂力 point after the age-growth cap: 12 * 2 / 3 = 8.
  const qiGrowthYears = Math.max(0, Math.min(age, 26) - 14)
  const jingGrowthYears = Math.max(0, Math.min(age, 24) - 14)
  const qiAgeGrowth = INT((qiGrowthYears * (constitution + strength) * 2) / 3)
  const jingAgeGrowth = INT((jingGrowthYears * intellect * 2) / 3)
  const knowledge = calculateKnowledgeBonus(taoismOrBuddhism)

  const baseQi = 600 + qiAgeGrowth + INT(currentMaxNeili / 3) + knowledge.qi
  const baseJing = 200 + jingAgeGrowth + INT(currentMaxJingli / 3) + knowledge.jing

  return {
    maxQi: baseQi + extraMaxQi,
    maxJing: baseJing + extraMaxJing,
    baseQi,
    baseJing,
    qiAgeGrowth,
    jingAgeGrowth,
    qiKnowledgeBonus: knowledge.qi,
    jingKnowledgeBonus: knowledge.jing,
    extraMaxQi,
    extraMaxJing,
  }
}
