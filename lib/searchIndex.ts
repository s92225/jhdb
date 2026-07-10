import { getAllSkills, getAllQuests, getAllManuals, getAllDungeons } from './data'

export type SearchEntry = {
  label: string
  href: string
  group: string
  keywords?: string
}

const STATIC_PAGES: SearchEntry[] = [
  { label: '武技總覽', href: '/skills', group: '頁面' },
  { label: '武技多選比較', href: '/skills/compare', group: '頁面' },
  { label: '特效效果模擬器', href: '/skills/simulator', group: '頁面', keywords: '連擊 兵器加成 暗勁 組合技能' },
  { label: '任務流程', href: '/guides/quests', group: '頁面' },
  { label: '副本資訊', href: '/guides/dungeons', group: '頁面' },
  { label: '師傅給物', href: '/guides/masters', group: '頁面' },
  { label: '屬性獲得表', href: '/guides/attributes', group: '頁面' },
  { label: '武器神兵', href: '/equipment', group: '頁面', keywords: '神兵 鑄煉 武器' },
  { label: '武功秘笈', href: '/equipment/manuals', group: '頁面', keywords: '秘笈' },
  { label: '遊戲系統總覽', href: '/systems', group: '頁面', keywords: '特殊系統' },
  { label: '五行相生相剋', href: '/systems/five-elements', group: '頁面', keywords: '五行 相生 相剋' },
  { label: '打坐時間計算器', href: '/tools/dazuo', group: '頁面', keywords: '打坐 內力' },
  { label: '按精教程', href: '/tools/macros', group: '頁面', keywords: '按鍵精靈 OCR 自動打坐' },
  { label: '近期更新', href: '/updates', group: '頁面', keywords: '更新 公告' },
]

let _cache: SearchEntry[] | null = null

export function buildSearchIndex(): SearchEntry[] {
  if (_cache) return _cache
  const entries: SearchEntry[] = [...STATIC_PAGES]

  for (const s of getAllSkills() as any[]) {
    const name = String(s?.name ?? '').trim()
    const id = String(s?.id ?? '').trim()
    if (!name || !id) continue
    entries.push({
      label: name,
      href: `/skills/${encodeURIComponent(id)}`,
      group: '武技',
      keywords: [s?.sect, s?.tier].filter(Boolean).join(' '),
    })
  }

  for (const q of getAllQuests() as any[]) {
    const name = String(q?.name ?? '').trim()
    if (!name) continue
    entries.push({ label: name, href: '/guides/quests', group: '任務', keywords: String(q?.category ?? '') })
  }

  for (const m of getAllManuals() as any[]) {
    const name = String(m?.name ?? '').trim()
    if (!name) continue
    entries.push({ label: name, href: '/equipment/manuals', group: '秘笈' })
  }

  for (const d of getAllDungeons() as any[]) {
    const name = String(d?.name ?? '').trim()
    if (!name) continue
    entries.push({ label: name, href: '/guides/dungeons', group: '副本' })
  }

  _cache = entries
  return entries
}
