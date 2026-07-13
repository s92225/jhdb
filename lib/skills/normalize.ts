// lib/skills/normalize.ts
export type UISkillMove = {
  name: string
  neishang: number | null
  bishang: number | null
  beishan: number | null
  beizhao: number | null
  level: number | null
}

/** 連擊進攻：攻擊時有一定機率於當回合連續出招多次，每招傷害按比例縮放 */
export type ComboAttack = {
  type: '連擊進攻'
  /** 發動機率（0–1），例如 0.33 ≈ 33% */
  triggerChance: number
  /** 發動時連續出招次數 */
  hitCount: number
  /** 發動時每招傷害倍率下限（0–1） */
  damageMultiplierMin: number
  /** 發動時每招傷害倍率上限（0–1） */
  damageMultiplierMax: number
  /** 給 UI 顯示的完整說明 */
  description: string
}

/**
 * 技能特殊效果（discriminated union）。
 * 日後新增其他效果時，只需加入新的 type 並擴充此 union。
 */
export type HeritageUltimate = {
  type: '傳承絕學'
  /** 發動機率（0–1），例如 0.10 = 10% */
  triggerChance: number
  /** 傷害倍率，例如 5 = 原傷害的 5 倍 */
  damageMultiplier: number
  /** 是否必中 */
  alwaysHit: boolean
  /** 給 UI 顯示的完整說明 */
  description: string
}

/** 暗勁／毒性／寒毒：命中時疊加層數，發作時每層扣減氣血與精神 */
export type DoTEffect = {
  type: '暗勁' | '毒性' | '寒毒'
  /** 效果名稱 */
  effectName: string
  /** 觸發機率（0–1） */
  triggerChance: number
  /** 疊加上限 */
  maxStacks: number
  /** 每層扣減氣血 */
  hpPerStack: number
  /** 每層扣減精神 */
  spiritPerStack: number
  /** 給 UI 顯示的完整說明 */
  description: string
}

/** 忙碌狀態：命中時有機率使目標陷入忙碌 */
export type StunEffect = {
  type: '忙碌狀態'
  /** 觸發機率（0–1） */
  triggerChance: number
  /** 最少持續回合 */
  minTurns: number
  /** 最多持續回合 */
  maxTurns: number
  /** 給 UI 顯示的完整說明 */
  description: string
}

export type SkillSpecialEffect = ComboAttack | HeritageUltimate | DoTEffect | StunEffect

export type SkillWeaponBonus = {
  weaponName: string   // 兵器名稱
  bonusPercentMin: number // 傷害加成百分比下限
  bonusPercentMax: number // 傷害加成百分比上限
  description: string
}

export type ComboSkill = {
  partner: string        // 配對輕功名稱
  partnerType: string    // 配對類型（基本輕功）
  level: number          // 等級要求
  bonus: number          // 閃避率加成百分比
}

export type UISkill = {
  id: string
  name: string
  sourceTag: string | null // 這裡用來放「門派/公共武技/武館」
  sect: string | null      // UI 顯示用（同上即可）
  tier: string | null
  configs: string[]
  requirement: {
    neili?: number | null
    jingli?: number | null
    prerequisites?: Array<{ skillId: string; level?: number | null }>
    notes?: string | null
  } | null
  moves: UISkillMove[]
  averages: {
    neishang?: number | null
    bishang?: number | null
    beishan?: number | null
    beizhao?: number | null
  } | null
  specialEffects?: SkillSpecialEffect[] | null
  weaponBonus?: SkillWeaponBonus[] | null
  comboSkill?: ComboSkill | null
  rawSource?: string | null
}

// ---- 傳承絕學：9 種上古傳承無上神武 ----
const HERITAGE_ULTIMATE_SKILLS = new Set([
  '降龍奧訣',
  '摩訶迦葉指',
  '諸天滅劍訣',
  '破陽冷光劍',
  '乾坤九曦訣',
  '碧燄逍遙手',
  '太極真義',
  '笑滄海傲訣',
  '逍遙御風',
])

// ---- 連擊進攻：18 種技能 ----
const COMBO_ATTACK_SKILLS = new Set([
  '如意刀法',
  '打狗棒法',
  '飛星術',
  '太極劍',
  '少林醉棍',
  '九陰白骨爪',
  '不知名劍法',
  '辟邪劍法',
  '九曲劍法',
  '岳家散手',
  '胡家刀法',
  '鐵掌掌法',
  '空明拳',
  '銀索金鈴',
  '六脈神劍',
  '覆雨劍法',
  '天刀八訣',
  '燎原槍法',
])

// ---- 兵器專屬威力加成 ----
// 裝備對應神兵時，使用該武技每一招傷害均提升 50%（固定值）。
const WEAPON_BONUS_MAP: Record<string, SkillWeaponBonus> = {
  '血刀刀法': {
    weaponName: '血刀',
    bonusPercentMin: 50,
    bonusPercentMax: 50,
    description: '裝備「血刀」時使用「血刀刀法」，每一招傷害均提升 50%',
  },
  '玄鐵劍法': {
    weaponName: '真．玄鐵神劍',
    bonusPercentMin: 50,
    bonusPercentMax: 50,
    description: '裝備「真．玄鐵神劍」時使用「玄鐵劍法」，每一招傷害均提升 50%',
  },
  '日月輪法': {
    weaponName: '五輪歸一',
    bonusPercentMin: 50,
    bonusPercentMax: 50,
    description: '裝備「五輪歸一」時使用「日月輪法」，每一招傷害均提升 50%',
  },
}

function splitConfigs(s: unknown): string[] {
  if (Array.isArray(s)) return s.filter(Boolean).map(String)
  if (typeof s === 'string' && s.trim()) {
    return s
      .split(/[，,]/)
      .map((x) => x.trim())
      .filter(Boolean)
  }
  return []
}

function toNumberOrNull(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN
  return Number.isFinite(n) ? n : null
}

function normalizeMove(m: any): UISkillMove {
  // 支援兩種 schema：
  // A) neishang/bishang/beishan/beizhao/level
  // B) inner/arm/gotDodged/gotParried/level
  return {
    name: String(m?.name ?? ''),
    neishang: toNumberOrNull(m?.neishang ?? m?.inner),
    bishang: toNumberOrNull(m?.bishang ?? m?.arm),
    beishan: toNumberOrNull(m?.beishan ?? m?.gotDodged),
    beizhao: toNumberOrNull(m?.beizhao ?? m?.gotParried),
    level: toNumberOrNull(m?.level),
  }
}

function normalizeRequirement(s: any): UISkill['requirement'] {
  // A) 舊版：requirement 物件
  if (s?.requirement && typeof s.requirement === 'object') {
    const r = s.requirement
    return {
      neili: toNumberOrNull(r?.neili),
      jingli: toNumberOrNull(r?.jingli),
      prerequisites: Array.isArray(r?.prerequisites)
        ? r.prerequisites
            .map((p: any) => ({
              skillId: String(p?.skillId ?? ''),
              level: toNumberOrNull(p?.level),
            }))
            .filter((p: any) => p.skillId)
        : undefined,
      notes: typeof r?.notes === 'string' ? r.notes : null,
    }
  }

  // B) 新版：requirements: [{name,value,raw}]
  if (Array.isArray(s?.requirements)) {
    let neili: number | null | undefined = undefined
    let jingli: number | null | undefined = undefined
    const prerequisites: Array<{ skillId: string; level?: number | null }> = []
    const notes: string[] = []

    for (const it of s.requirements) {
      const name = String(it?.name ?? '').trim()
      const value = toNumberOrNull(it?.value)
      const raw = typeof it?.raw === 'string' ? it.raw : null
      if (!name) continue

      if (name === '內力') neili = value
      else if (name === '精力') jingli = value
      else if (value !== null) prerequisites.push({ skillId: name, level: value })
      else if (raw) notes.push(raw)
      else notes.push(name)
    }

    const hasAny =
      neili !== undefined ||
      jingli !== undefined ||
      prerequisites.length > 0 ||
      notes.length > 0

    return hasAny
      ? {
          neili: neili ?? null,
          jingli: jingli ?? null,
          prerequisites: prerequisites.length ? prerequisites : undefined,
          notes: notes.length ? notes.join('\n') : null,
        }
      : null
  }

  return null
}

function hasAnyKey(obj: any, keys: string[]) {
  return !!obj && typeof obj === 'object' && keys.some((k) => obj[k] !== undefined && obj[k] !== null)
}

function normalizeAverages(s: any): UISkill['averages'] {
  const a = s?.averages
  if (!a || typeof a !== 'object') return null

  // 如果本來就有 neishang/bishang...
  if (hasAnyKey(a, ['neishang', 'bishang', 'beishan', 'beizhao'])) {
    return {
      neishang: toNumberOrNull(a.neishang),
      bishang: toNumberOrNull(a.bishang),
      beishan: toNumberOrNull(a.beishan),
      beizhao: toNumberOrNull(a.beizhao),
    }
  }

  // 新版：inner/arm/gotDodged/gotParried
  if (hasAnyKey(a, ['inner', 'arm', 'gotDodged', 'gotParried'])) {
    return {
      neishang: toNumberOrNull(a.inner),
      bishang: toNumberOrNull(a.arm),
      beishan: toNumberOrNull(a.gotDodged),
      beizhao: toNumberOrNull(a.gotParried),
    }
  }

  return null
}

export function normalizeSkill(raw: any): UISkill {
  const id = String(raw?.id ?? '')
  const name = String(raw?.name ?? '')
  const configs = splitConfigs(raw?.configs ?? raw?.config)

  const movesArr = Array.isArray(raw?.moves) ? raw.moves : []

  const moves = movesArr.map(normalizeMove).filter((m: UISkillMove) => m.name)



  // 你的 skills.json：family 就是門派/公共武技
  const family = typeof raw?.family === 'string' ? raw.family.trim() : ''
  const sourceTag =
    typeof raw?.sourceTag === 'string'
      ? raw.sourceTag
      : family
        ? family
        : null

  const tier =
    typeof raw?.tier === 'string'
      ? raw.tier
      : typeof raw?.stage === 'string'
        ? raw.stage
        : null

  const rawSource =
    typeof raw?.rawSource === 'string'
      ? raw.rawSource
      : typeof raw?.sourceFile === 'string'
        ? raw.sourceFile
        : null

  // ---- 特殊效果 ----
  const specialEffects: any[] = []
  
  // 從 raw data 讀取 specialEffects（暗勁/毒性/寒毒等）
  if (Array.isArray(raw?.specialEffects)) {
    for (const e of raw.specialEffects) {
      specialEffects.push(e)
    }
  }
  
  // 連擊進攻（硬編碼）
  // 攻擊時有 10% 機率發動，於當回合連續出招兩次；每招傷害為原本的 50%（以維持戰鬥平衡）。
  if (COMBO_ATTACK_SKILLS.has(name)) {
    specialEffects.push({
      type: '連擊進攻',
      triggerChance: 0.10,
      hitCount: 2,
      damageMultiplierMin: 0.5,
      damageMultiplierMax: 0.5,
      description:
        '攻擊時有 10% 機率發動，於當回合連續出招兩次。發動時，每招傷害為原本的 50%（以維持戰鬥平衡）。',
    })
  }

  // 傳承絕學（硬編碼）
  // 裝備本門上古傳承無上神武（2000 級）搭配本門高級內功（700 級），每次攻擊 10% 機率發動傳承絕學，必中且傷害暴增 5 倍。
  if (HERITAGE_ULTIMATE_SKILLS.has(name)) {
    specialEffects.push({
      type: '傳承絕學',
      triggerChance: 0.10,
      damageMultiplier: 5,
      alwaysHit: true,
      description:
        '裝備本門上古傳承無上神武（2000 級）搭配本門高級內功（700 級），每次攻擊 10% 機率發動傳承絕學，必中且傷害暴增 5 倍。',
    })
  }

  // 暗勁/毒性/寒毒（硬編碼）
  if (name === '天山六陽掌') {
    specialEffects.push({
      type: '暗勁',
      effectName: '燮理陰陽',
      triggerChance: 0.20,
      maxStacks: 80,
      hpPerStack: 50,
      spiritPerStack: 50,
      description: '命中敵手即有 20% 機率疊加 1 層（燮理陰陽），上限 80 層，發作時每層扣減 50 點氣血與 50 點精神。暗勁狀態於角色重登或伺服器重啟後均會保留，僅在層數歸零或角色死亡時清除。',
    })
  }
  if (name === '降龍十八掌') {
    specialEffects.push({
      type: '暗勁',
      effectName: '降龍掌掌力',
      triggerChance: 0.10,
      maxStacks: 20,
      hpPerStack: 100,
      spiritPerStack: 50,
      description: '命中敵手即有 10% 機率疊加 1 層（降龍掌掌力），上限 20 層，發作時每層扣減 100 點氣血與 50 點精神。暗勁狀態於角色重登或伺服器重啟後均會保留，僅在層數歸零或角色死亡時清除。',
    })
  }
  if (name === '星宿毒掌') {
    specialEffects.push({
      type: '毒性',
      effectName: '星宿奇毒',
      triggerChance: 1.0,
      maxStacks: 50,
      hpPerStack: 10,
      spiritPerStack: 10,
      description: '命中敵手即疊加 1 層（星宿奇毒），上限 50 層。毒發時每層扣減 10 點氣血與 10 點精神。毒性狀態於角色重登或伺服器重啟後均會保留，僅在層數歸零或角色死亡時清除。',
    })
  }
  if (name === '飛星術') {
    specialEffects.push({
      type: '毒性',
      effectName: '生死符',
      triggerChance: 0.06,
      maxStacks: 99,
      hpPerStack: 300,
      spiritPerStack: 300,
      description: '需激發本門內功「化功大法」為當前內功心法，施展「飛星術」進行攻擊，化功大法與飛星術皆需達 700 級以上。命中敵手並造成傷害時，有 6% 機率為對方附加 1 層「生死符」奇毒，最高疊加 99 層，發作時每層扣減 300 點氣血與 300 點精神，層數隨發作遞減。此奇毒狀態會隨角色存檔保留，僅在層數歸零或角色死亡時才會消失。',
    })
  }

  // 忙碌狀態（硬編碼）
  // 苗家劍法、彈指神通、冰蠶毒掌、火焰刀命中時有 10% 機率使目標陷入 1~3 回合忙碌狀態。
  const STUN_SKILLS = new Set(['苗家劍法', '彈指神通', '冰蠶毒掌', '火焰刀'])
  if (STUN_SKILLS.has(name)) {
    specialEffects.push({
      type: '忙碌狀態',
      triggerChance: 0.10,
      minTurns: 1,
      maxTurns: 3,
      description: '命中目標時有 10% 機率使目標陷入 1~3 回合的忙碌狀態，目標若已忙碌則不會重複觸發。',
    })
  }

  const weaponBonus: SkillWeaponBonus[] = []
  if (WEAPON_BONUS_MAP[name]) {
    weaponBonus.push(WEAPON_BONUS_MAP[name])
  }

  // ---- 組合技能 ----
  const comboSkill: ComboSkill | null = raw?.comboSkill ? {
    partner: String(raw.comboSkill.partner ?? ''),
    partnerType: String(raw.comboSkill.partnerType ?? ''),
    level: toNumberOrNull(raw.comboSkill.level) ?? 0,
    bonus: toNumberOrNull(raw.comboSkill.bonus) ?? 0,
  } : null

  return {
    id,
    name,
    sourceTag,
    sect: sourceTag, // UI 顯示門派就用 sourceTag
    tier,
    configs,
    requirement: normalizeRequirement(raw),
    moves,
    averages: normalizeAverages(raw),
    specialEffects: specialEffects.length ? specialEffects : null,
    weaponBonus: weaponBonus.length ? weaponBonus : null,
    comboSkill,
    rawSource,
  }
}

export function normalizeSkills(list: any): UISkill[] {
  const arr = Array.isArray(list) ? list : []
  return arr.map(normalizeSkill).filter((s) => s.id && s.name)
}
