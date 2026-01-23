
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

export type SkillTier = '第一階' | '第二階' | '第三階' | '上古傳承' | '未知'

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
  steps: QuestStep[] // 允許空
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
  rawSource?: string | null
}
