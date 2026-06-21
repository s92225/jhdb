
// lib/types.ts
export type SourceTag = string

export type SkillConfig =
  | '拳腳'
  | '劍法'
  | '刀法'
  | '棍法'
  | '短兵'
  | '招架'
  | '輕功'
  | '內功'
  | '未知'

export type SkillTier = '第一階' | '第二階' | '第三階' | '上古傳承無上神武' | '未知'

export interface SkillRequirement {
  neili?: number | null
  jingli?: number | null
  prerequisites?: Array<{ skillId: string; level?: number | null }> | null
  notes?: string | null
}

export interface SkillMove {
  name: string
  neishang?: number | null
  bishang?: number | null
  beishan?: number | null
  beizhao?: number | null
  level?: number | null
  notes?: string | null
}

export interface SkillAverages {
  neishang?: number | null
  bishang?: number | null
  beishan?: number | null
  beizhao?: number | null
}

/** 連擊進攻：攻擊時有一定機率於當回合連續出招多次，每招傷害按比例縮放 */
export interface ComboAttack {
  type: '連擊進攻'
  /** 發動機率（0–1），例如 0.33 ≈ 33% */
  triggerChance: number
  /** 發動時連續出招次數 */
  hitCount: number
  /** 發動時每招傷害倍率下限（0–1），例如 0.5 = 原傷害的 50% */
  damageMultiplierMin: number
  /** 發動時每招傷害倍率上限（0–1），例如 1.0 = 原傷害的 100% */
  damageMultiplierMax: number
  /** 給 UI 顯示的完整說明 */
  description: string
}

/** 暗勁/毒性效果：命中敵手有機率疊加層數，發作時每層扣減氣血與精神 */
export interface DotEffect {
  type: '暗勁' | '毒性' | '寒毒'
  /** 效果名稱，如「太極真氣」「金剛伏魔」 */
  effectName: string
  /** 命中觸發機率（0–1），例如 0.30 = 30% */
  triggerChance: number
  /** 疊加上限層數 */
  maxStacks: number
  /** 發作時每層扣減氣血 */
  hpPerStack: number
  /** 發作時每層扣減精神 */
  spiritPerStack: number
  /** 給 UI 顯示的完整說明 */
  description: string
}

/**
 * 技能特殊效果（discriminated union）。
 * 日後新增其他效果時，只需加入新的 interface 並擴充此 union。
 */
export type SkillSpecialEffect = ComboAttack | DotEffect

export interface SkillWeaponBonus {
  weaponName: string
  /** 傷害加成百分比下限 */
  bonusPercentMin: number
  /** 傷害加成百分比上限 */
  bonusPercentMax: number
  description: string
}

export interface Skill {
  id: string
  name: string
  sourceTag: SourceTag
  sect?: string | null
  tier: SkillTier
  configs: SkillConfig[]
  requirement?: SkillRequirement | null
  moves: SkillMove[]
  averages?: SkillAverages | null
  specialEffects?: SkillSpecialEffect[] | null
  weaponBonus?: SkillWeaponBonus[] | null
  rawSource?: string | null // 來源檔名/段落，方便追溯，不一定有
}

export interface QuestStep {
  stepNo: number
  title?: string | null
  location?: string | null
  objective?: string | null
  dialogueOrCommand?: string | null
  notes?: string | null
}

export interface Quest {
  id: string
  name: string
  type?: string | null
  startNpc?: string | null
  startLocation?: string | null
  requirements?: string | null
  rewards?: string | null
  steps?: string[] // 允許空
  rawSource?: string | null
}

export interface ManualAcquisition {
  type?: '掉落' | '副本' | '合成' | '購買' | '活動' | '其他' | null
  sourceName?: string | null // NPC/副本/商人/事件
  location?: string | null
  requirements?: string | null
  notes?: string | null
}

export interface Manual {
  id: string
  name: string
  skillId?: string | null
  acquisition?: ManualAcquisition | null
  learningRequirements?: string | null
  rawSource?: string | null
}

export interface Dungeon {
  id: string
  name: string
  entryNpc?: string | null
  entryLocation?: string | null
  requirements?: string | null
  tags: string[]
  bosses?: Array<{ name: string; notes?: string | null }> | null
  drops?: Array<{ name: string; notes?: string | null }> | null
  tips?: Array<{ text: string; source?: string | null; updatedAt?: string | null }> | null
  rawSource?: string | null
}

export interface UpdateNote {
  id: string
  date?: string | null
  title?: string | null
  content: string
  sourceFile?: string | null
  rawSource?: string | null
}

export interface MasterSkill {
  name: string
  /** 給物條件：技能自身等級 */
  skillLevel?: number | null
  /** 給物條件：讀書寫字等級 */
  readWrite?: number | null
  /** 給物條件：本門內功等級 */
  sectNeigong?: number | null
  /** 給物條件：基本輕功等級 */
  basicQinggong?: number | null
  /** 給物條件：基本劍法等級 */
  basicSword?: number | null
}

export interface Master {
  id: string
  /** 門派 */
  sect: string
  /** 師傅名字 */
  name: string
  /** 所在地 */
  location: string
  /** 可傳授的技能及給物條件 */
  skills: MasterSkill[]
}
