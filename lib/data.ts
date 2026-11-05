import { visibleQuestEntries } from './guide-catalog'
import rawSkills from '@/data/skills.json'
import rawQuests from '@/data/quests.json'
import rawManuals from '@/data/manuals.json'
import rawDungeons from '@/data/dungeons.json'
import dungeonGuide from '@/data/dungeons_integrated.json'
import rawUpdates from '@/data/updates.json'
import rawMasters from '@/data/masters.json'
// lib/data.ts
import fs from 'node:fs'
import path from 'node:path'
import quests from '@/data/quests.json'

import type {
  Skill,
  Quest,
  Manual,
  Dungeon,
  UpdateNote,
  Master,
} from './types'

import { normalizeSkills } from './skills/normalize'

// -------- helpers (safe array) --------
function asArray<T = any>(v: any): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

// -------- cached normalized data (avoid re-normalizing on every call) --------
let _skillsCache: Skill[] | null = null

export function getAllSkills(): Skill[] {
  if (_skillsCache) return _skillsCache
  // normalizeSkills returns UI-friendly shape; we cast to Skill to match existing app types.
  // (Key point: downstream pages won't crash even if raw schema differs.)
  _skillsCache = normalizeSkills(rawSkills as any) as unknown as Skill[]
  return _skillsCache
}



export function getAllQuests(): Quest[] {
  // ✅ 優先使用整合攻略版
  try {
    const p = path.join(process.cwd(), 'data', 'quests_integrated.json')
    if (fs.existsSync(p)) {
      const t = fs.readFileSync(p, 'utf-8')
      const parsed = JSON.parse(t)

      // 兼容兩種格式：{ quests: [...] } 或 [...]
      const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.quests) ? parsed.quests : null
      if (arr) return arr as Quest[]
    }
  } catch {
    // ignore
  }

  // fallback：舊版
  return quests as Quest[]
}


export function getAllManuals(): Manual[] {
  return asArray<Manual>(rawManuals)
}

export function getAllDungeons(): Dungeon[] {
  // Search and homepage counts follow the same catalogue as /guides/dungeons.
  if (Array.isArray(dungeonGuide.dungeons)) return dungeonGuide.dungeons.map((d) => ({
    id: d.id, name: d.name,
    entryNpc: d.entry?.npc || null, entryLocation: d.entry?.location || null,
    requirements: [d.recommendedStrength?.stage,d.recommendedStrength?.config].filter(Boolean).join('；') || null,
    tags: [d.positioning?.type,d.positioning?.stage].filter((s): s is string => Boolean(s)),
    bosses: (d.bosses || []).map((name) => ({name})),
    drops: (d.loot || []).map((name) => ({name})),
    tips: (d.workflow || []).map((text) => ({text})),
  }))
  return asArray<Dungeon>(rawDungeons)
}

export function getAllUpdates(): UpdateNote[] {
  return [...asArray<UpdateNote>(rawUpdates)].sort((a, b) => {
    const date = (value?: string | null) => {
      const parsed = Date.parse(value || '')
      return Number.isFinite(parsed) ? parsed : 0
    }
    return date(b.date) - date(a.date)
  })
}

// --- Async accessors (server components friendly) ---
export async function getSkills(): Promise<Skill[]> {
  return getAllSkills()
}

export async function getSkillById(id: string): Promise<Skill | null> {
  const list = getAllSkills()

  // Next / browser 可能給你不同形態的字串：原樣 / 已 decode / 已 encode
  const decoded = safeDecodeURIComponent(id)
  const encoded = encodeURIComponent(id)

  const hit =
    list.find((x: any) => x.id === id) ||
    list.find((x: any) => x.id === decoded) ||
    list.find((x: any) => encodeURIComponent(String(x.id)) === id) ||
    list.find((x: any) => encodeURIComponent(String(x.id)) === encoded)

  return (hit as any) ?? null
}

function safeDecodeURIComponent(s: string) {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}


export async function getQuests(): Promise<Quest[]> {
  return getAllQuests()
}

export async function getManuals(): Promise<Manual[]> {
  return getAllManuals()
}

export async function getDungeons(): Promise<Dungeon[]> {
  return getAllDungeons()
}

export async function getUpdates(): Promise<UpdateNote[]> {
  return getAllUpdates()
}

export function getAllMasters(): Master[] {
  return asArray<Master>(rawMasters)
}

export async function getMasters(): Promise<Master[]> {
  return getAllMasters()
}

export function getStats() {
  return {
    skills: getAllSkills().length,
    quests: visibleQuestEntries(getAllQuests()).length,
    manuals: getAllManuals().length,
    dungeons: getAllDungeons().length,
    updates: getAllUpdates().length,
    masters: getAllMasters().length,
  }
}
