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
export type SkillSpecialEffect = ComboAttack

export type SkillWeaponBonus = {
  weaponName: string   // 兵器名稱
  bonusPercentMin: number // 傷害加成百分比下限
  bonusPercentMax: number // 傷害加成百分比上限
  description: string
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
  rawSource?: string | null
}

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
const WEAPON_BONUS_MAP: Record<string, SkillWeaponBonus> = {
  '血刀刀法': {
    weaponName: '血刀',
    bonusPercentMin: 50,
    bonusPercentMax: 100,
    description: '裝備「血刀」時使用「血刀刀法」，每一招傷害均提升 50%-100%',
  },
  '玄鐵劍法': {
    weaponName: '真．玄鐵神劍',
    bonusPercentMin: 50,
    bonusPercentMax: 100,
    description: '裝備「真．玄鐵神劍」時使用「玄鐵劍法」，每一招傷害均提升 50%-100%',
  },
  '日月輪法': {
    weaponName: '五輪歸一',
    bonusPercentMin: 50,
    bonusPercentMax: 100,
    description: '裝備「五輪歸一」時使用「日月輪法」，每一招傷害均提升 50%-100%',
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
  const specialEffects: SkillSpecialEffect[] = []
  if (COMBO_ATTACK_SKILLS.has(name)) {
    specialEffects.push({
      type: '連擊進攻',
      triggerChance: 0.33,
      hitCount: 2,
      damageMultiplierMin: 0.5,
      damageMultiplierMax: 1.0,
      description: '攻擊時有約 33% 機率發動，於當回合連續出招兩次。發動時，每招傷害為原本的 50%-100%。',
    })
  }

  const weaponBonus: SkillWeaponBonus[] = []
  if (WEAPON_BONUS_MAP[name]) {
    weaponBonus.push(WEAPON_BONUS_MAP[name])
  }

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
    rawSource,
  }
}

export function normalizeSkills(list: any): UISkill[] {
  const arr = Array.isArray(list) ? list : []
  return arr.map(normalizeSkill).filter((s) => s.id && s.name)
}
