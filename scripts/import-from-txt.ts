/**
 * 匯入/解析腳本（盡量解析 + 不造資料）：
 * - 讀取 data/raw/*.txt
 * - 解析成結構化資料
 * - 寫入 data/skills.json / quests.json / manuals.json / dungeons.json / updates.json
 *
 * 規則：
 * - 解析不到的欄位保持 null/空字串/空陣列
 * - 每筆都保留 sourceFile 與 rawExcerpt 方便追溯
 */

import fs from 'node:fs'
import path from 'node:path'

type RawFile = { file: string; content: string }

type SkillMove = {
  name: string
  inner?: number | null
  arm?: number | null
  gotDodged?: number | null // 被閃
  gotParried?: number | null // 被招
  level?: number | null
  rawLine?: string
}

type SkillRequirement = {
  name: string
  value?: number | null
  raw?: string
}

type Skill = {
  id: string
  name: string
  family: string // 來源：公共武技 / 武當 / 少林...
  stage?: string | null // 第一階 / 第二階 / 第三階 / 上古傳承...
  config?: string | null // 配置
  requirements: SkillRequirement[]
  moves: SkillMove[]
  averages?: {
    inner?: number | null
    arm?: number | null
    gotDodged?: number | null
    gotParried?: number | null
    level?: number | null
  } | null
  sourceFile: string
  rawExcerpt: string
}

type UpdateItem = {
  id: string
  date: string | null
  title: string
  content: string
  sourceFile: string
}

type Dungeon = {
  id: string
  name: string
  hintLocation?: string | null
  notes?: string | null
  sourceFile: string
  rawExcerpt: string
}

type Manual = {
  id: string
  name: string
  obtain?: string | null
  learnRequirementsText?: string | null
  requirements: SkillRequirement[]
  sourceFile: string
  rawExcerpt: string
}

type Quest = {
  id: string
  name: string
  description?: string | null
  rewardsText?: string | null
  requirementsText?: string | null
  sourceFile: string
  rawExcerpt: string
}

const RAW_DIR = path.join(process.cwd(), 'data', 'raw')
const OUT_DIR = path.join(process.cwd(), 'data')

function readAllTxt(dir: string): RawFile[] {
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.txt'))
  return files.map((f) => ({
    file: f,
    content: fs.readFileSync(path.join(dir, f), 'utf8'),
  }))
}

function writeJson(fileName: string, data: any) {
  fs.writeFileSync(path.join(OUT_DIR, fileName), JSON.stringify(data, null, 2), 'utf8')
}

function normalizeText(s: string): string {
  return s
    .replace(/\u3000/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim()
}

function safeSlice(s: string, max = 2000) {
  const t = s.trim()
  return t.length <= max ? t : t.slice(0, max) + '\n...(truncated)'
}

function slugId(prefix: string, sourceFile: string, name: string, idx: number) {
  const base = `${prefix}-${sourceFile}-${name}-${idx}`
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return base || `${prefix}-${idx}`
}

/** 解析像：內力: 2500 / 基本拳腳: 250 / 太極神功: 10 */
function parseRequirementsFromLines(lines: string[]): SkillRequirement[] {
  const reqs: SkillRequirement[] = []

  for (const line of lines) {
    const t = normalizeText(line)
    if (!t) continue

    const m = t.match(/^(.+?)\s*[:：]\s*([0-9]+)\s*$/)
    if (m) {
      reqs.push({ name: m[1].trim(), value: Number(m[2]), raw: t })
      continue
    }

    const m2 = t.match(/^.*?(需|需要)\s*([^\s]+)\s*([0-9]+)\s*$/)
    if (m2) {
      reqs.push({ name: m2[2].trim(), value: Number(m2[3]), raw: t })
      continue
    }

    if (t.includes(':') || t.includes('：') || t.includes('需')) {
      reqs.push({ name: t, value: null, raw: t })
    }
  }

  return reqs
}

/**
 * 解析武技表格行：
 * 招式 內傷 臂傷 被閃 被招 等級
 */
function parseMoveLine(line: string): SkillMove | null {
  const raw = line
  const t = normalizeText(line)
  if (!t) return null
  if (/^=+/.test(t)) return null
  if (t.includes('招式') && t.includes('內傷')) return null

  // 平均值 行
  if (t.startsWith('平均') || t.startsWith('平均值')) {
    const nums = t.match(/([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)/)
    if (nums) {
      return {
        name: '平均值',
        inner: Number(nums[1]),
        arm: Number(nums[2]),
        gotDodged: Number(nums[3]),
        gotParried: Number(nums[4]),
        level: Number(nums[5]),
        rawLine: raw,
      }
    }
    return { name: '平均值', rawLine: raw }
  }

  // 一般行：名稱 + 5 個數字
  const m = t.match(/^(.*?)([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s*$/)
  if (!m) return null

  const name = (m[1] ?? '').trim()
  if (!name) return null

  return {
    name,
    inner: Number(m[2]),
    arm: Number(m[3]),
    gotDodged: Number(m[4]),
    gotParried: Number(m[5]),
    level: Number(m[6]),
    rawLine: raw,
  }
}

function guessFamilyFromFile(fileName: string): string {
  const base = fileName.replace(/\.txt$/i, '').trim()
  if (base.includes('公共武技')) return '公共武技'
  if (base.includes('update')) return '更新公告'
  return base || '未知'
}

function splitSkillBlocks(content: string): string[] {
  return content
    .split(/={10,}/g)
    .map((p) => p.trim())
    .filter(Boolean)
}

function parseSkillsFromFile(fileName: string, content: string): Skill[] {
  const family = guessFamilyFromFile(fileName)
  const text = normalizeText(content)

  if (family === '更新公告') return []

  const looksLikeSkillTable = /配置\s*[:：]/.test(text) && /招式/.test(text) && /內傷/.test(text)
  if (!looksLikeSkillTable) return []

  const blocks = splitSkillBlocks(text)

  let currentStage: string | null = null
  const skills: Skill[] = []
  let idx = 0

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trimEnd())
    const nonEmpty = lines.map((l) => l.trim()).filter(Boolean)
    if (nonEmpty.length === 0) continue

    const stageLine = nonEmpty.find((l) => /^<.*>$/.test(l))
    if (stageLine) {
      currentStage = stageLine.replace(/^<|>$/g, '').trim()
      const hasMore = nonEmpty.some((l) => l !== stageLine)
      if (!hasMore) continue
    }

    const nameConfigLine = nonEmpty.find((l) => l.includes('配置'))
    if (!nameConfigLine) continue

    const nameMatch = nameConfigLine.match(/^(.+?)\s+配置\s*[:：]\s*(.+)$/)
    const name = nameMatch ? nameMatch[1].trim() : ''
    const config = nameMatch ? nameMatch[2].trim() : null
    if (!name) continue

 const learnIdx = nonEmpty.findIndex((l) => l.includes('學習條件'))
const tableHeaderIdx = nonEmpty.findIndex((l) => l.includes('招式') && l.includes('內傷'))

let reqLines: string[] = []
if (learnIdx >= 0) {
  const end = tableHeaderIdx >= 0 ? tableHeaderIdx : nonEmpty.length

  // ✅ 1) 把「學習條件」同一行後面的內容也納入（常見：學習條件 內力: 100）
  const learnLine = nonEmpty[learnIdx] ?? ''
  const tail = learnLine.replace(/^.*?學習條件\s*/, '').trim()
  if (tail) reqLines.push(tail)

  // ✅ 2) 再抓後續行（精力等通常在下一行）
  reqLines.push(...nonEmpty.slice(learnIdx + 1, end))
}


    const requirements = parseRequirementsFromLines(reqLines)

    let moves: SkillMove[] = []
    if (tableHeaderIdx >= 0) {
      const moveLines = nonEmpty.slice(tableHeaderIdx + 1)
      for (const ml of moveLines) {
        const mv = parseMoveLine(ml)
        if (!mv) continue
        moves.push(mv)
      }
    }

    let averages: Skill['averages'] = null
    const avgIdx = moves.findIndex((m) => m.name === '平均值')
    if (avgIdx >= 0) {
      const avg = moves[avgIdx]
      averages = {
        inner: avg.inner ?? null,
        arm: avg.arm ?? null,
        gotDodged: avg.gotDodged ?? null,
        gotParried: avg.gotParried ?? null,
        level: avg.level ?? null,
      }
      moves = moves.filter((_, i) => i !== avgIdx)
    }

    idx += 1
    skills.push({
      id: slugId('skill', fileName, name, idx),
      name,
      family,
      stage: currentStage,
      config,
      requirements,
      moves,
      averages,
      sourceFile: fileName,
      rawExcerpt: safeSlice(block, 2500),
    })
  }

  return skills
}

/**
 * 解析更新檔
 */
function parseUpdatesFromFile(fileName: string, content: string): UpdateItem[] {
  const text = normalizeText(content)
  const isUpdateFile = fileName.toLowerCase().includes('update')

  if (!isUpdateFile) {
    return [
      {
        id: slugId('update', fileName, fileName, 1),
        date: null,
        title: fileName.replace(/\.txt$/i, ''),
        content: text,
        sourceFile: fileName,
      },
    ]
  }

  const lines = text.split('\n')
  const items: UpdateItem[] = []
  let currentDate: string | null = null
  let buffer: string[] = []
  let bufferTitle: string = fileName.replace(/\.txt$/i, '')
  let seg = 0

  function flush() {
    const body = buffer.join('\n').trim()
    if (!body) return
    seg += 1
    items.push({
      id: slugId('update', fileName, bufferTitle, seg),
      date: currentDate,
      title: bufferTitle,
      content: body,
      sourceFile: fileName,
    })
    buffer = []
  }

  const dateLineRe = /^(?:\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}|\d{4}年更新內容)$/

  for (const line of lines) {
    const t = line.trim()
    if (!t) continue

    if (/^\d{4}年更新內容$/.test(t)) {
      flush()
      currentDate = null
      bufferTitle = t
      continue
    }

    if (dateLineRe.test(t)) {
      flush()
      if (/^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}$/.test(t)) {
        currentDate = t
        bufferTitle = t
      } else {
        bufferTitle = t
      }
      continue
    }

    buffer.push(t)
  }

  flush()

  if (items.length === 0) {
    items.push({
      id: slugId('update', fileName, fileName, 1),
      date: null,
      title: fileName.replace(/\.txt$/i, ''),
      content: text,
      sourceFile: fileName,
    })
  }

  return items
}

/** 從更新/內容抽「新增副本<...>」 */
function extractDungeonsFromText(sourceFile: string, text: string): Dungeon[] {
  const out: Dungeon[] = []
  const lines = normalizeText(text).split('\n')
  let idx = 0

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    const m = t.match(/新增副本<([^>]+)>/)
    if (!m) continue

    const name = m[1].trim()
    const excerptLines = [t]
    for (let k = 1; k <= 6 && i + k < lines.length; k++) {
      const ln = lines[i + k].trim()
      if (!ln) continue
      if (/^\d+\.\s+/.test(ln)) break
      excerptLines.push(ln)
    }

    const rawExcerpt = excerptLines.join('\n')
    const hintMatch = rawExcerpt.match(/詳情請前往(.+?)。?$/)
    const hintLocation = hintMatch ? hintMatch[1].trim() : null

    idx += 1
    out.push({
      id: slugId('dungeon', sourceFile, name, idx),
      name,
      hintLocation,
      notes: null,
      sourceFile,
      rawExcerpt: safeSlice(rawExcerpt, 1200),
    })
  }

  return out
}

/** 從更新/內容抽「新增武功: XXX」作為秘笈/獲取方式資料 */
function extractManualsFromText(sourceFile: string, text: string): Manual[] {
  const out: Manual[] = []
  const lines = normalizeText(text).split('\n')
  let idx = 0

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    const m = t.match(/新增武功\s*[:：]\s*([^\s，。]+)/)
    if (!m) continue

    const name = m[1].trim()
    const excerptLines: string[] = [t]

    for (let k = 1; k <= 30 && i + k < lines.length; k++) {
      const ln = lines[i + k].trim()
      if (!ln) continue
      if (ln.includes('新增武功')) break
      if (/^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}$/.test(ln)) break
      excerptLines.push(ln)
    }

    const rawExcerpt = excerptLines.join('\n')
    const requirements = parseRequirementsFromLines(excerptLines)

    idx += 1
    out.push({
      id: slugId('manual', sourceFile, name, idx),
      name,
      obtain: null,
      learnRequirementsText: null,
      requirements,
      sourceFile,
      rawExcerpt: safeSlice(rawExcerpt, 2000),
    })
  }

  return out
}

/**
 * 任務：目前先「保守抽取」——不造資料
 * - 只要內容像任務段落，就存成 Quest，後續你要 quests_guide.json 再做深化整理
 */
function extractQuestsFromText(sourceFile: string, text: string): Quest[] {
  const out: Quest[] = []
  const lines = normalizeText(text).split('\n')
  let idx = 0

  // 很保守：遇到「任務」關鍵字就截取附近
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (!t) continue
    if (!t.includes('任務')) continue

    const name = t.length <= 40 ? t : t.slice(0, 40)
    const excerpt: string[] = [t]
    for (let k = 1; k <= 12 && i + k < lines.length; k++) {
      const ln = lines[i + k].trim()
      if (!ln) continue
      if (/^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}$/.test(ln)) break
      excerpt.push(ln)
    }

    idx += 1
    out.push({
      id: slugId('quest', sourceFile, name, idx),
      name,
      description: null,
      rewardsText: null,
      requirementsText: null,
      sourceFile,
      rawExcerpt: safeSlice(excerpt.join('\n'), 2000),
    })
  }

  return out
}

async function main() {
  const raws = readAllTxt(RAW_DIR)

  const allSkills: Skill[] = []
  const allUpdates: UpdateItem[] = []
  const allDungeons: Dungeon[] = []
  const allManuals: Manual[] = []
  const allQuests: Quest[] = []

  for (const rf of raws) {
    const txt = rf.content

    allSkills.push(...parseSkillsFromFile(rf.file, txt))
    const updates = parseUpdatesFromFile(rf.file, txt)
    allUpdates.push(...updates)

    const joinedUpdateText = updates.map((u) => u.content).join('\n')
    allDungeons.push(...extractDungeonsFromText(rf.file, joinedUpdateText))
    allManuals.push(...extractManualsFromText(rf.file, joinedUpdateText))

    // 任務：從 update + 其他檔案都可以抽
    allQuests.push(...extractQuestsFromText(rf.file, txt))
  }

  writeJson('skills.json', allSkills)
  writeJson('updates.json', allUpdates)
  writeJson('dungeons.json', allDungeons)
  writeJson('manuals.json', allManuals)
  writeJson('quests.json', allQuests)

  console.log(`Imported raw txt files: ${raws.length}`)
  console.log(`skills: ${allSkills.length}, quests: ${allQuests.length}, manuals: ${allManuals.length}, dungeons: ${allDungeons.length}, updates: ${allUpdates.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
