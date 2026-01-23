// lib/skills/normalize.ts
export type UISkillMove = {
  name: string
  neishang: number | null
  bishang: number | null
  beishan: number | null
  beizhao: number | null
  level: number | null
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
  rawSource?: string | null
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
  const moves = movesArr.map(normalizeMove).filter((m) => m.name)

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
    rawSource,
  }
}

export function normalizeSkills(list: any): UISkill[] {
  const arr = Array.isArray(list) ? list : []
  return arr.map(normalizeSkill).filter((s) => s.id && s.name)
}
