'use client'

import { useEffect, useMemo, useState } from 'react'
import weaponsData from '@/data/weapons.json'

type ElKey = '木' | '火' | '土' | '金' | '水' | '無'

export type SkillLite = {
  id: string
  name: string
  sect: string | null
  tier: string | null
  configs: string[]
  avgNeishang: number | null
  avgBishang: number | null
  combo: {
    triggerChance: number
    hitCount: number
    multMin: number
    multMax: number
    description: string
  } | null
  weaponBonus: {
    weaponName: string
    minPct: number
    maxPct: number
    description: string
  } | null
  /** 組合技能：配置指定輕功達等級後獲得閃避加成 */
  comboSkill: {
    partner: string
    partnerType: string
    level: number
    bonus: number
  } | null
  /** 暗勁 / 毒性 / 寒毒 stacking effect (auto-detected from skills.json) */
  stack: {
    type: string // 暗勁 / 毒性 / 寒毒
    effectName: string
    triggerChance: number
    maxStacks: number
    hpPerStack: number
    spiritPerStack: number
    description: string
  } | null
  /** 反震：成功招架時無視防禦反彈傷害 */
  fanzhen: boolean
}

const ELEMENTS: ElKey[] = ['木', '火', '土', '金', '水', '無']
const EL_COLOR: Record<ElKey, string> = {
  木: '#3aa657',
  火: '#e0413a',
  土: '#c98a3a',
  金: '#a3a3a3',
  水: '#2f6fb5',
  無: '#6a6a6a',
}

const SHENG_NEXT: Record<string, string> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
}
const KE_NEXT: Record<string, string> = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木',
}

// 系統規則（皆由「對方屬性 → 我方屬性」方向觸發）：
//   對方生我方 → 攻擊方 +20%
//   對方剋我方 → 攻擊方 -20%
// 反方向 (我方 → 對方) 不觸發。
const SHENG_BONUS = 20
const KE_PENALTY = -20

function elementMod(self: ElKey, target: ElKey) {
  if (self === '無' || target === '無' || self === target) {
    return { pct: 0, label: '中立' }
  }
  // defender → attacker via 剋 (e.g. 我方=木, 對方=金 → 金剋木)
  if (KE_NEXT[target] === self)
    return { pct: KE_PENALTY, label: '對方剋我方 (-)' }
  // defender → attacker via 生 (e.g. 我方=金, 對方=土 → 土生金)
  if (SHENG_NEXT[target] === self)
    return { pct: SHENG_BONUS, label: '對方生我方 (+)' }
  // attacker → defender directions are inert
  if (KE_NEXT[self] === target)
    return { pct: 0, label: '我方剋對方（中立）' }
  if (SHENG_NEXT[self] === target)
    return { pct: 0, label: '我方生對方（中立）' }
  return { pct: 0, label: '中立' }
}

const STACK_COLOR: Record<string, string> = {
  暗勁: '#a855f7',
  毒性: '#16a34a',
  寒毒: '#0ea5e9',
}

// 上古神兵：裝備任一把時，每次命中（含連擊每一招）有 50% 機率觸發「神兵之暴擊」，
// 該次攻擊的最終傷害額外 +30%。期望乘數 = 1 + 0.5 × 0.3 = 1.15。
// 每把神兵屬於某種武技類型，必須與武技配置相符才能裝備：
//   劍法 (金) · 短兵 (水) · 刀法 (火) · 棍法 (木) · 拳腳 (土)
type WeaponType = '劍法' | '短兵' | '刀法' | '棍法' | '拳腳'

const WEAPON_TYPE_ELEMENT: Record<WeaponType, string> = {
  劍法: '金',
  短兵: '水',
  刀法: '火',
  棍法: '木',
  拳腳: '土',
}

// Build full weapon list from data/weapons.json
const WEAPON_CATEGORY_TYPE: Record<string, WeaponType> = {
  '劍類': '劍法',
  '刀類': '刀法',
  '棍棒類': '棍法',
  '短兵類': '短兵',
}

type WeaponEntry = { name: string; type: WeaponType; attack: number; isDivine: boolean }

const ALL_WEAPONS: WeaponEntry[] = (() => {
  const list: WeaponEntry[] = []
  for (const cat of weaponsData.divineWeapons as Array<{
    type: string
    weapons: Array<{
      name: string
      attack: number
      forgeable: boolean
      upgradedName?: string
      upgradedAttack?: number
    }>
  }>) {
    const wt = WEAPON_CATEGORY_TYPE[cat.type]
    if (!wt) continue
    for (const w of cat.weapons) {
      list.push({ name: w.name, type: wt, attack: w.attack, isDivine: false })
      if (w.forgeable && w.upgradedName && w.upgradedAttack != null) {
        list.push({ name: w.upgradedName, type: wt, attack: w.upgradedAttack, isDivine: true })
      }
    }
  }
  // Other weapons with known attack
  for (const w of weaponsData.otherWeapons as Array<{
    name: string
    attack: number | null
    notes?: string
  }>) {
    if (w.attack != null && w.attack > 0) {
      // Infer weapon type from name
      const name = w.name
      let wt: WeaponType | null = null
      if (name.includes('劍')) wt = '劍法'
      else if (name.includes('刀')) wt = '刀法'
      else if (name.includes('棒') || name.includes('杖')) wt = '棍法'
      else if (name.includes('輪') || name.includes('鞭') || name.includes('扇') || name.includes('索')) wt = '短兵'
      if (wt) {
        list.push({ name: w.name, type: wt, attack: w.attack, isDivine: false })
      }
    }
  }
  return list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
})()

const DIVINE_CRIT_CHANCE = 0.5
const DIVINE_CRIT_BONUS = 0.3 // +30%

const WEAPON_TYPE_TOKENS: WeaponType[] = ['劍法', '短兵', '刀法', '棍法', '拳腳']
function detectWeaponType(configs: string[]): WeaponType | null {
  for (const c of configs) {
    for (const t of WEAPON_TYPE_TOKENS) {
      if (c.includes(t)) return t
    }
  }
  return null
}

// Reverse mapping: element → weapon type label (for display next to element buttons)
const ELEMENT_WEAPON_LABEL: Record<ElKey, string | null> = {
  木: '棍法',
  火: '刀法',
  土: '拳腳',
  金: '劍法',
  水: '短兵',
  無: null,
}

// 左右互搏之術：最終傷害 ×1.5（作用於所有加成之後的最終環節）
const ZUOYOU_MULT = 1.5

export function EffectSimulator({ skills }: { skills: SkillLite[] }) {
  // Filter to skills with usable damage data
  const usable = useMemo(
    () =>
      skills
        .filter((s) => (s.avgNeishang ?? 0) > 0)
        .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant')),
    [skills],
  )

  const [skillId, setSkillId] = useState<string>(() => usable[0]?.id ?? '')
  const skill = useMemo(
    () => usable.find((s) => s.id === skillId),
    [usable, skillId],
  )

  const [selfEl, setSelfEl] = useState<ElKey>('無')
  const [targetEl, setTargetEl] = useState<ElKey>('無')

  const [equippedWeapon, setEquippedWeapon] = useState<boolean>(true)
  const [comboCfg, setComboCfg] = useState(true) // 組合技能 (輕功配置)
  const [opponentDodge, setOpponentDodge] = useState(0) // 對方閃避 %
  const [turns, setTurns] = useState(10) // 戰鬥回合數（用來估算疊層 DoT）
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null)
  const [zuoyou, setZuoyou] = useState(false) // 左右互搏之術

  // ── derived ──────────────────────────────────────────────────────────────
  const baseNei = skill?.avgNeishang ?? 0
  const baseBi = skill?.avgBishang ?? 0
  const baseTotal = baseNei + baseBi

  // Skill weapon type (e.g. 拳腳 / 劍法 / 刀法 / 棍法 / 短兵)
  const skillWeaponType: WeaponType | null = useMemo(
    () => (skill ? detectWeaponType(skill.configs) : null),
    [skill],
  )

  // If the currently selected weapon doesn't match the skill's weapon type, clear it.
  const selectedWeaponEntry = ALL_WEAPONS.find((w) => w.name === selectedWeapon)
  const weaponCompatible =
    selectedWeapon === null
      ? true
      : selectedWeaponEntry?.type === skillWeaponType
  const effectiveWeapon = weaponCompatible ? selectedWeapon : null
  const effectiveWeaponEntry = effectiveWeapon ? selectedWeaponEntry : null

  // Auto-suggest self element based on skill's weapon type
  const suggestedEl: ElKey | null = useMemo(() => {
    if (!skillWeaponType) return null
    const el = WEAPON_TYPE_ELEMENT[skillWeaponType]
    return (ELEMENTS as string[]).includes(el) ? (el as ElKey) : null
  }, [skillWeaponType])

  // Auto-apply suggested element when skill changes
  useEffect(() => {
    if (suggestedEl) setSelfEl(suggestedEl)
  }, [suggestedEl])

  const elMod = elementMod(selfEl, targetEl)

  const weaponMatched =
    equippedWeapon && skill?.weaponBonus ? true : false
  const weaponPct = weaponMatched
    ? (skill!.weaponBonus!.minPct + skill!.weaponBonus!.maxPct) / 2
    : 0

  // 上古神兵之暴擊 (per-hit expectation; only applies when weapon is a 真· divine weapon)
  const isDivineWeapon = effectiveWeaponEntry?.isDivine ?? false
  const divineExpectedMult =
    1 + (isDivineWeapon ? DIVINE_CRIT_CHANCE * DIVINE_CRIT_BONUS : 0)

  // Weapon attack power (flat addition to base damage, 1:1)
  const weaponAttack = effectiveWeaponEntry?.attack ?? 0

  // Per-hit damage: (內傷 + 臂傷 + 武器攻擊力) × (1 + element + weapon) × 神兵暴擊期望
  const totalAddPct = elMod.pct + weaponPct
  const multiplier = (1 + totalAddPct / 100) * divineExpectedMult
  const perHitNei = Math.round((baseNei + weaponAttack) * multiplier)
  const perHitBi = Math.round(baseBi * multiplier)
  const perHit = perHitNei + perHitBi

  // Combo: when it triggers, you get (hitCount - 1) EXTRA strikes at avgMult × base
  // damage, on top of the normal 100% strike.
  //   turnMult = 1 + p × (hitCount - 1) × avgMult
  // expectedStrikesPerTurn (for UI / DoT) = 1 + p × (hitCount - 1)
  let expectedStrikes = 1
  let avgComboMult = 1
  let comboTurnMult = 1
  if (skill?.combo) {
    avgComboMult = (skill.combo.multMin + skill.combo.multMax) / 2
    const p = skill.combo.triggerChance
    const hc = skill.combo.hitCount
    expectedStrikes = 1 + p * (hc - 1)
    comboTurnMult = 1 + p * (hc - 1) * avgComboMult
  }

  const hitProb = Math.max(0, 1 - opponentDodge / 100)
  const turnMultiplier = comboTurnMult * hitProb
  const perTurnNei = Math.round(perHitNei * turnMultiplier)
  const perTurnBi = Math.round(perHitBi * turnMultiplier)
  const perTurnDirect = perTurnNei + perTurnBi

  // Stacking DoT (auto-detected from skill)
  let stackInfo: {
    expectedStacks: number
    dotPerStack: number
    dotTotal: number
  } | null = null
  if (skill?.stack) {
    const hitsOverFight = expectedStrikes * hitProb * turns
    const expectedStacks = Math.min(
      skill.stack.maxStacks,
      hitsOverFight * skill.stack.triggerChance,
    )
    const dotPerStack = skill.stack.hpPerStack
    stackInfo = {
      expectedStacks,
      dotPerStack,
      dotTotal: Math.round(expectedStacks * dotPerStack),
    }
  }

  // 左右互搏之術：最終傷害 ×1.5（獨立作用於主攻擊與連擊，在所有加成之後）
  const zuoyouMult = zuoyou ? ZUOYOU_MULT : 1
  const perTurnDirectFinal = Math.round(perTurnDirect * zuoyouMult)
  const perTurnNeiFinal = Math.round(perTurnNei * zuoyouMult)
  const perTurnBiFinal = Math.round(perTurnBi * zuoyouMult)
  const perTurnTotal =
    perTurnDirectFinal + (stackInfo ? Math.round(stackInfo.dotTotal / turns) : 0)

  // Defensive bonus from 組合技能 (配對輕功 → 閃避加成)
  const dodgeBonus = comboCfg && skill?.comboSkill ? skill.comboSkill.bonus : 0

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),360px]">
        {/* LEFT: inputs */}
        <div className="space-y-4">
          {/* Skill picker */}
          <SkillPicker
            skills={usable}
            value={skillId}
            onChange={setSkillId}
            selected={skill}
          />

          {/* 五行 */}
          <div className="rounded-2xl border border-hairline bg-canvas p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-ink">五行對位</div>
              {suggestedEl && (
                <span className="text-[11px] text-muted">
                  已依武技類型自動選擇我方：{suggestedEl}（{ELEMENT_WEAPON_LABEL[suggestedEl]}）
                </span>
              )}
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <ElPicker label="我方" value={selfEl} onChange={setSelfEl} highlightEl={suggestedEl} />
              <ElPicker label="對方" value={targetEl} onChange={setTargetEl} />
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-xs">
              <span className="rounded-full bg-surface-strong px-2 py-0.5 font-medium text-ink">
                關係：{elMod.label}
              </span>
              <span
                className="font-bold tabular-nums"
                style={{ color: elMod.pct >= 0 ? '#3aa657' : '#e0413a' }}
              >
                {elMod.pct > 0 ? '+' : ''}
                {elMod.pct}%
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted">
              規則：對方生我方 +{SHENG_BONUS}%、對方剋我方 {KE_PENALTY}%；反向不觸發。
              五行對應武器：木＝棍法、火＝刀法、土＝拳腳、金＝劍法、水＝短兵。
            </p>
          </div>

          {/* 裝備與條件 */}
          <div className="rounded-2xl border border-hairline bg-canvas p-5">
            <div className="text-sm font-semibold text-ink">裝備與戰況</div>

            <div className="mt-3 space-y-3 text-sm">
              <Toggle
                label={
                  skill?.weaponBonus
                    ? `裝備「${skill.weaponBonus.weaponName}」(+${skill.weaponBonus.minPct}~${skill.weaponBonus.maxPct}%)`
                    : '此武技無對應兵器加成'
                }
                disabled={!skill?.weaponBonus}
                checked={equippedWeapon}
                onChange={setEquippedWeapon}
              />
              <Toggle
                label={
                  skill?.comboSkill
                    ? `配置「${skill.comboSkill.partner}」達 ${skill.comboSkill.level} 級 (閃避 +${skill.comboSkill.bonus}%)`
                    : '此武技無組合技能配對'
                }
                disabled={!skill?.comboSkill}
                checked={comboCfg}
                onChange={setComboCfg}
              />
              <Toggle
                label="左右互搏之術（技能 ≥100 級、悟性 ≤100 時，最終傷害 ×1.5）"
                checked={zuoyou}
                onChange={setZuoyou}
              />

              {/* 武器選擇 */}
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted">
                    武器（攻擊力 1:1 加入傷害，真·神兵額外暴擊 +15%）
                  </span>
                  {skillWeaponType ? (
                    <span className="text-[10px] text-muted">
                      此武技類型：
                      <span className="font-bold text-ink">
                        {skillWeaponType}
                      </span>
                      <span className="ml-1">
                        ({WEAPON_TYPE_ELEMENT[skillWeaponType]})
                      </span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted">
                      無武器類型（無法裝備武器）
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedWeapon(null)}
                    className={[
                      'rounded-full border px-2.5 py-0.5 text-[11px]',
                      selectedWeapon === null
                        ? 'border-ink bg-ink text-white'
                        : 'border-hairline text-ink hover:bg-surface-soft',
                    ].join(' ')}
                  >
                    無
                  </button>
                  {ALL_WEAPONS.filter((w) => w.type === skillWeaponType).map((w) => {
                    const active = selectedWeapon === w.name
                    return (
                      <button
                        key={w.name}
                        type="button"
                        onClick={() => setSelectedWeapon(w.name)}
                        title={
                          `${w.type}（${WEAPON_TYPE_ELEMENT[w.type]}）${w.isDivine ? ' · 真·神兵暴擊' : ''}`
                        }
                        className={[
                          'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
                          active
                            ? w.isDivine
                              ? 'border-amber-600 bg-amber-500 text-white'
                              : 'border-ink bg-ink text-white'
                            : 'border-hairline text-ink hover:bg-surface-soft',
                        ].join(' ')}
                      >
                        {w.name}
                        <span
                          className={[
                            'text-[9px] font-semibold',
                            active ? 'text-white/90' : 'text-muted',
                          ].join(' ')}
                        >
                          · {w.attack}攻{w.isDivine ? ' · 暴擊' : ''}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {selectedWeapon && !weaponCompatible && (
                  <p className="mt-1 text-[11px] text-rausch">
                    所選武器與當前武技類型不符，效果不會套用。
                  </p>
                )}
              </div>

              {skill?.stack ? (
                <div
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: STACK_COLOR[skill.stack.type] ?? '#dddddd',
                    background: (STACK_COLOR[skill.stack.type] ?? '#dddddd') + '14',
                  }}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="rounded-full px-2 py-0.5 font-bold text-white"
                      style={{
                        background: STACK_COLOR[skill.stack.type] ?? '#6a6a6a',
                      }}
                    >
                      {skill.stack.type}
                    </span>
                    <span className="font-semibold text-ink">
                      {skill.stack.effectName}
                    </span>
                  </div>
                  <div className="mt-1.5 text-xs leading-relaxed text-bodytext">
                    {skill.stack.description}
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1.5 text-[10px]">
                    <MiniBadge label="觸發" value={`${Math.round(skill.stack.triggerChance * 100)}%`} />
                    <MiniBadge label="上限" value={`${skill.stack.maxStacks} 層`} />
                    <MiniBadge label="氣血/層" value={String(skill.stack.hpPerStack)} />
                    <MiniBadge label="精神/層" value={String(skill.stack.spiritPerStack)} />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-hairline-soft bg-surface-soft p-3 text-xs text-muted">
                  此武技無 暗勁 / 毒性 / 寒毒 疊層效果。
                </div>
              )}

              <Slider
                label="對方閃避 %"
                v={opponentDodge}
                set={setOpponentDodge}
                min={0}
                max={70}
                accent="#6a6a6a"
              />
              <Slider
                label="戰鬥回合數 (用於估算疊層)"
                v={turns}
                set={setTurns}
                min={1}
                max={30}
                accent="#2f6fb5"
                unit=" 回合"
              />
            </div>
          </div>
        </div>

        {/* RIGHT: output (sticky on large screens) */}
        <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pb-4">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-rausch bg-rausch/5 p-5">
            <div className="text-xs font-medium text-rausch">
              預估每回合總傷（內傷 + 臂傷{stackInfo ? ' + DoT' : ''}）
            </div>
            <div className="mt-1 text-4xl font-bold tabular-nums text-ink">
              {perTurnTotal.toLocaleString()}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-md bg-canvas p-2">
                <div className="text-muted">內傷 / 回合</div>
                <div className="font-bold tabular-nums text-ink">
                  {perTurnNeiFinal.toLocaleString()}
                </div>
              </div>
              <div className="rounded-md bg-canvas p-2">
                <div className="text-muted">臂傷 / 回合</div>
                <div className="font-bold tabular-nums text-ink">
                  {perTurnBiFinal.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-muted">
              每招 {perHit.toLocaleString()} ({perHitNei.toLocaleString()} 內 +{' '}
              {perHitBi.toLocaleString()} 臂{weaponAttack > 0 ? ` + ${weaponAttack} 武器攻` : ''}) × 回合倍率 {comboTurnMult.toFixed(2)}
              {hitProb < 1 ? ` × 命中 ${Math.round(hitProb * 100)}%` : ''}
              {zuoyou ? ` × 左右互搏 ${ZUOYOU_MULT}` : ''}
              {stackInfo
                ? ` + DoT 均攤 ${Math.round(stackInfo.dotTotal / turns).toLocaleString()}`
                : ''}
            </div>
          </div>

          <div className="rounded-2xl border border-hairline bg-canvas p-5">
            <div className="text-sm font-semibold text-ink">傷害組成</div>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="平均內傷（資料庫）" value={baseNei} />
              <Row label="平均臂傷（資料庫）" value={baseBi} />
              <Row label="基礎合計" value={baseTotal} />
              {effectiveWeapon && weaponAttack > 0 && (
                <Row
                  label={`武器攻擊力「${effectiveWeapon}」`}
                  value={weaponAttack}
                />
              )}
              <Row
                label={`五行 ${elMod.pct >= 0 ? '+' : ''}${elMod.pct}%`}
                value={Math.round((baseTotal + weaponAttack) * (elMod.pct / 100))}
              />
              <Row
                label={`兵器 +${weaponPct.toFixed(0)}%`}
                value={Math.round((baseTotal + weaponAttack) * (weaponPct / 100))}
              />
              {isDivineWeapon && (
                <Row
                  label={`神兵暴擊「${effectiveWeapon}」 50% × +30% → 期望 +15%`}
                  value={Math.round(
                    (baseTotal + weaponAttack) * (1 + totalAddPct / 100) * 0.15,
                  )}
                />
              )}
              <div className="mt-2 border-t border-hairline-soft pt-2 text-xs">
                <div className="flex justify-between text-muted">
                  <span>單招傷害</span>
                  <span className="font-bold tabular-nums text-ink">
                    {perHit.toLocaleString()}
                  </span>
                </div>
                {skill?.combo ? (
                  <div className="mt-1 flex justify-between text-muted">
                    <span>
                      連擊（{Math.round(skill.combo.triggerChance * 100)}% 機率多打{' '}
                      {skill.combo.hitCount - 1} 招 ·{' '}
                      {skill.combo.multMin === skill.combo.multMax
                        ? `${Math.round(skill.combo.multMin * 100)}%`
                        : `${Math.round(skill.combo.multMin * 100)}–${Math.round(
                            skill.combo.multMax * 100,
                          )}%`}
                      ）→ 回合 ×{comboTurnMult.toFixed(2)}
                    </span>
                    <span className="font-bold tabular-nums text-ink">
                      +{Math.round(perHit * (comboTurnMult - 1)).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 text-muted">
                    此武技無連擊進攻效果，回合倍率 = 1.0
                  </div>
                )}
                {zuoyou && (
                  <div className="mt-1 flex justify-between text-muted">
                    <span>左右互搏之術 ×{ZUOYOU_MULT}</span>
                    <span className="font-bold tabular-nums text-ink">
                      +{(perTurnDirectFinal - perTurnDirect).toLocaleString()}
                    </span>
                  </div>
                )}
                {hitProb < 1 && (
                  <div className="mt-1 flex justify-between text-muted">
                    <span>命中率 {Math.round(hitProb * 100)}%</span>
                    <span className="font-bold tabular-nums text-rausch">
                      −{(
                        Math.round(perHit * comboTurnMult) - perTurnDirect
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="mt-1 flex justify-between border-t border-hairline-soft pt-1 text-muted">
                  <span>每回合直傷{zuoyou ? '（含左右互搏）' : ''}</span>
                  <span className="font-bold tabular-nums text-ink">
                    {perTurnDirectFinal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {stackInfo && skill?.stack && (
            <div
              className="rounded-2xl border p-5"
              style={{
                borderColor: STACK_COLOR[skill.stack.type] ?? '#dddddd',
              }}
            >
              <div className="text-sm font-semibold text-ink">
                {skill.stack.type} 預估累計
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <Row
                  label={`${turns} 回合預期疊層數`}
                  value={Number(stackInfo.expectedStacks.toFixed(1))}
                />
                <Row
                  label={`累計 DoT (氣血)`}
                  value={stackInfo.dotTotal}
                />
                <div className="text-muted">
                  上限 {skill.stack.maxStacks} 層；發作時 1 層扣
                  {skill.stack.hpPerStack} 氣血 / {skill.stack.spiritPerStack} 精神。
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-hairline bg-canvas p-5">
            <div className="text-sm font-semibold text-ink">防禦/特效</div>
            <ul className="mt-3 space-y-1.5 text-xs text-bodytext">
              <li>
                組合技能閃避加成：
                <span className="ml-1 font-bold tabular-nums text-ink">
                  +{dodgeBonus}%
                </span>
                {skill?.comboSkill ? (
                  <span className="ml-1 text-muted">
                    （配置「{skill.comboSkill.partner}」達{' '}
                    {skill.comboSkill.level} 級）
                  </span>
                ) : (
                  <span className="ml-1 text-muted">（此武技無配對）</span>
                )}
              </li>
              {skill?.combo && (
                <li className="text-muted">{skill.combo.description}</li>
              )}
              {skill?.weaponBonus && (
                <li className="text-muted">{skill.weaponBonus.description}</li>
              )}
              {skill?.fanzhen && (
                <li>
                  <span className="font-semibold text-ink">反震：</span>
                  <span className="text-muted">
                    成功招架對手攻擊時，100% 機率發動，無視防禦直接造成反彈傷害。僅在成功招架時觸發，閃避或被擊中時不發動。
                  </span>
                </li>
              )}
            </ul>
          </div>

          <p className="text-[11px] leading-relaxed text-muted">
            模擬以資料庫平均內傷為基準，套用五行、兵器、連擊、左右互搏、上古神兵、疊層 DoT、閃避等
            可量化條件。實際傷害仍受招式等級、屬性、被閃/被招、buff 等影響。
          </p>
        </aside>
        </div>
      </div>
    </div>
  )
}

/* helpers */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hairline-soft bg-surface-soft p-2">
      <div className="text-[10px] text-muted">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-ink">{value}</div>
    </div>
  )
}

function MiniBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-canvas px-1.5 py-1 text-center">
      <div className="text-[9px] text-muted">{label}</div>
      <div className="text-[11px] font-bold tabular-nums text-ink">{value}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted">{label}</span>
      <span className="font-mono tabular-nums text-ink">
        {value.toLocaleString()}
      </span>
    </div>
  )
}

function ElPicker({
  label,
  value,
  onChange,
  highlightEl,
}: {
  label: string
  value: ElKey
  onChange: (v: ElKey) => void
  highlightEl?: ElKey | null
}) {
  return (
    <div>
      <div className="text-[11px] font-medium text-muted">{label}</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {ELEMENTS.map((e) => {
          const active = value === e
          const highlighted = highlightEl === e && !active
          const weaponLabel = ELEMENT_WEAPON_LABEL[e]
          return (
            <button
              key={e}
              type="button"
              onClick={() => onChange(e)}
              className="flex h-14 w-16 flex-col items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{
                background: EL_COLOR[e],
                outline: active
                  ? '3px solid #222'
                  : highlighted
                    ? '2px dashed #e0413a'
                    : 'none',
                outlineOffset: active ? 2 : 1,
              }}
            >
              <span>{e}</span>
              {weaponLabel && (
                <span className="text-[10px] font-normal leading-tight opacity-80">
                  {weaponLabel}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Slider({
  label,
  v,
  set,
  min,
  max,
  step,
  accent,
  unit = '%',
}: {
  label: string
  v: number
  set: (n: number) => void
  min: number
  max: number
  step?: number
  accent: string
  unit?: string
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-bold tabular-nums" style={{ color: accent }}>
          {v.toLocaleString()}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={v}
        onChange={(e) => set(Number(e.target.value))}
        className="mt-1 w-full"
        style={{ accentColor: accent }}
      />
    </label>
  )
}

type TraitFilter = 'all' | '連擊' | '兵器' | '疊層' | '組合' | '反震'

function SkillPicker({
  skills,
  value,
  onChange,
  selected,
}: {
  skills: SkillLite[]
  value: string
  onChange: (id: string) => void
  selected: SkillLite | undefined
}) {
  const [query, setQuery] = useState('')
  const [sect, setSect] = useState<string>('全部')
  const [trait, setTrait] = useState<TraitFilter>('all')

  const sects = useMemo(() => {
    const s = new Set<string>()
    skills.forEach((k) => k.sect && s.add(k.sect))
    return ['全部', ...Array.from(s).sort((a, b) => a.localeCompare(b, 'zh-Hant'))]
  }, [skills])

  const filtered = useMemo(() => {
    const q = query.trim()
    return skills.filter((s) => {
      if (sect !== '全部' && s.sect !== sect) return false
      if (trait === '連擊' && !s.combo) return false
      if (trait === '兵器' && !s.weaponBonus) return false
      if (trait === '疊層' && !s.stack) return false
      if (trait === '組合' && !s.comboSkill) return false
      if (trait === '反震' && !s.fanzhen) return false
      if (q && !s.name.includes(q) && !(s.sect ?? '').includes(q)) return false
      return true
    })
  }, [skills, query, sect, trait])

  const TRAITS: Array<{ k: TraitFilter; label: string }> = [
    { k: 'all', label: '全部' },
    { k: '連擊', label: '連擊' },
    { k: '兵器', label: '兵器加成' },
    { k: '疊層', label: '暗勁/毒性' },
    { k: '組合', label: '組合技能' },
    { k: '反震', label: '反震' },
  ]

  return (
    <div className="rounded-2xl border border-hairline bg-canvas p-5">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-semibold text-ink">武技選擇</div>
        <div className="text-[11px] text-muted">
          {filtered.length} / {skills.length} 招
        </div>
      </div>

      {/* Currently selected */}
      {selected && (
        <div className="mt-3 rounded-xl border border-rausch/40 bg-rausch/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-rausch">
                目前選擇
              </div>
              <div className="mt-0.5 text-base font-bold text-ink">
                {selected.name}
              </div>
              <div className="mt-0.5 text-[11px] text-muted">
                {[selected.sect, selected.tier].filter(Boolean).join(' · ')}
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              {selected.combo && <TraitChip color="#2563eb">連擊</TraitChip>}
              {selected.weaponBonus && (
                <TraitChip color="#ca8a04">兵器</TraitChip>
              )}
              {selected.stack && (
                <TraitChip color={STACK_COLOR[selected.stack.type] ?? '#6a6a6a'}>
                  {selected.stack.type}
                </TraitChip>
              )}
              {selected.comboSkill && (
                <TraitChip color="#16a34a">組合</TraitChip>
              )}
              {selected.fanzhen && (
                <TraitChip color="#9333ea">反震</TraitChip>
              )}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <Stat label="平均內傷" value={String(selected.avgNeishang ?? '—')} />
            <Stat label="平均臂傷" value={String(selected.avgBishang ?? '—')} />
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mt-3 relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋武技名稱或門派…"
          className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 pl-8 text-sm text-ink focus:border-rausch focus:outline-none"
        />
        <svg
          className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      {/* Trait filter chips */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {TRAITS.map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => setTrait(t.k)}
            className={[
              'rounded-full border px-2.5 py-0.5 text-[11px]',
              trait === t.k
                ? 'border-ink bg-ink text-white'
                : 'border-hairline text-ink hover:bg-surface-soft',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sect filter chips */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {sects.map((sc) => (
          <button
            key={sc}
            type="button"
            onClick={() => setSect(sc)}
            className={[
              'rounded-full border px-2.5 py-0.5 text-[11px]',
              sect === sc
                ? 'border-rausch bg-rausch text-white'
                : 'border-hairline text-bodytext hover:bg-surface-soft',
            ].join(' ')}
          >
            {sc}
          </button>
        ))}
      </div>

      {/* Filtered list */}
      <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-hairline-soft">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted">
            無符合條件的武技
          </div>
        ) : (
          <ul className="divide-y divide-hairline-soft">
            {filtered.map((s) => {
              const active = s.id === value
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onChange(s.id)}
                    className={[
                      'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm',
                      active
                        ? 'bg-rausch/10 text-ink'
                        : 'hover:bg-surface-soft text-ink',
                    ].join(' ')}
                  >
                    <span className="min-w-0">
                      <span className="font-medium">{s.name}</span>
                      <span className="ml-2 text-[11px] text-muted">
                        {s.sect ?? ''}
                      </span>
                    </span>
                    <span className="flex shrink-0 gap-1">
                      {s.combo && <Dot color="#2563eb" title="連擊" />}
                      {s.weaponBonus && <Dot color="#ca8a04" title="兵器" />}
                      {s.stack && (
                        <Dot
                          color={STACK_COLOR[s.stack.type] ?? '#6a6a6a'}
                          title={s.stack.type}
                        />
                      )}
                      {s.comboSkill && <Dot color="#16a34a" title="組合" />}
                      {s.fanzhen && <Dot color="#9333ea" title="反震" />}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function TraitChip({
  color,
  children,
}: {
  color: string
  children: React.ReactNode
}) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
      style={{ background: color }}
    >
      {children}
    </span>
  )
}

function Dot({ color, title }: { color: string; title: string }) {
  return (
    <span
      title={title}
      className="inline-block h-2 w-2 rounded-full"
      style={{ background: color }}
    />
  )
}

function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <label
      className={[
        'flex cursor-pointer items-center gap-2 text-sm',
        disabled ? 'cursor-not-allowed opacity-50' : '',
      ].join(' ')}
    >
      <input
        type="checkbox"
        checked={checked && !disabled}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-hairline accent-rausch"
      />
      <span className="text-ink">{label}</span>
    </label>
  )
}
