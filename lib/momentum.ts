/** Official rules: https://eokatok.mystrikingly.com/ · 31 Oct 2026.
 * Percentages are theoretical; the official quick-reference truncates toward zero.
 * The server's internal rounding / combination order is not published.
 */
export const MOMENTUM_RULES = {
  min: -10, max: 10, decay: 0.85, hitPerPoint: 1,
  normalDamagePerPoint: 0.5, specialDamagePerPoint: 0.25, damageCap: 5,
  reset: ['戰鬥結束', '死亡', '逃跑', '打坐', '吐納', '斷線'],
  events: [
    { name: '命中', attacker: 2, defender: -2 },
    { name: '落空', attacker: -2, defender: 1 },
    { name: '被格擋', attacker: -1, defender: 1 },
    { name: '遭招架反傷', attacker: -4, defender: 4 },
    { name: '傳承奧義', attacker: 3, defender: -3 },
    { name: '控場成功', attacker: 2, defender: -2 },
    { name: '連擊觸發', attacker: 1, defender: -1 },
  ],
} as const

export function momentumBonus(value: number) {
  const points = Math.max(MOMENTUM_RULES.min, Math.min(MOMENTUM_RULES.max, Number.isFinite(value) ? value : 0))
  const cap = (v: number) => Math.max(-MOMENTUM_RULES.damageCap, Math.min(MOMENTUM_RULES.damageCap, v))
  return { points, hit: points * MOMENTUM_RULES.hitPerPoint, normal: cap(points * MOMENTUM_RULES.normalDamagePerPoint), special: cap(points * MOMENTUM_RULES.specialDamagePerPoint) }
}

export function signedPercent(value: number, truncate = false) {
  const n = truncate ? Math.trunc(value) : Math.round(value * 100) / 100
  return `${n > 0 ? '+' : ''}${Object.is(n, -0) ? 0 : n}%`
}
