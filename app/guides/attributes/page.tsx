import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/app/components/Badge'
import rawDungeons from '@/data/dungeons.json'
import rawManuals from '@/data/manuals.json'
import rawQuests from '@/data/quests_integrated.json'
import rawSkills from '@/data/skills.json'

export const metadata: Metadata = {
  title: '屬性獲得概覽表｜人在江湖資料庫',
  description: '來源自 Google 試算表的屬性獲得整理。',
}

type AttributeRow = {
  item: string
  note1: string
  note2: string
  strength: string
  intellect: string
  constitution: string
  agility: string
}

const rows: AttributeRow[] = [
  {
    item: '真武秘典',
    note1: '每 20 級增加 1 點[臂力]',
    note2: '上限 1000 級',
    strength: '50',
    intellect: '',
    constitution: '',
    agility: '',
  },
  {
    item: '天樞經卷',
    note1: '每 20 級增加 1 點[悟性]',
    note2: '上限 1000 級',
    strength: '',
    intellect: '50',
    constitution: '',
    agility: '',
  },
  {
    item: '元始真法',
    note1: '每 20 級增加 1 點[根骨]',
    note2: '上限 1000 級',
    strength: '',
    intellect: '',
    constitution: '50',
    agility: '',
  },
  {
    item: '太清靈訣',
    note1: '每 20 級增加 1 點[身法]',
    note2: '上限 1000 級',
    strength: '',
    intellect: '',
    constitution: '',
    agility: '50',
  },
  {
    item: '《寒江武經》',
    note1: '二十七種公共技能均練滿',
    note2: '每個角色只能獲得 1 次',
    strength: '100',
    intellect: '',
    constitution: '100',
    agility: '100',
  },
  {
    item: '九陽神功',
    note1: '每提升 10 級皆可增加 1 點根骨',
    note2: '上限 2000 級',
    strength: '',
    intellect: '',
    constitution: '200',
    agility: '',
  },
  {
    item: '九陰神功',
    note1: '每提升 10 級皆可增加 1 點臂力',
    note2: '上限 2000 級',
    strength: '200',
    intellect: '',
    constitution: '',
    agility: '',
  },
  {
    item: '葵花魔功',
    note1: '每提升 10 級皆可增加 1 點身法',
    note2: '上限 2000 級',
    strength: '',
    intellect: '',
    constitution: '',
    agility: '200',
  },
  {
    item: '上古傳承無上神武',
    note1: '集齊二十六把神兵後兌換門派專屬之「上古傳承無上神武」下冊秘笈',
    note2: '上限 2000 級',
    strength: '50',
    intellect: '',
    constitution: '50',
    agility: '50',
  },
  {
    item: '公共武技',
    note1: '練達上限後可尋 GM 相助，以啟先天脈絡',
    note2: '每個角色只能獲得 1 次',
    strength: '100',
    intellect: '',
    constitution: '100',
    agility: '100',
  },
  {
    item: '無極大成',
    note1: '每 50 級增加 1 點[臂力]',
    note2: '上限 1000 級',
    strength: '20',
    intellect: '',
    constitution: '',
    agility: '',
  },
  {
    item: '龍龜散',
    note1: '提昇 5 點臂力',
    note2: '贊助<<寒江湖>>\n每個角色使用上限為 4 次',
    strength: '20',
    intellect: '',
    constitution: '',
    agility: '',
  },
  {
    item: '龍蛇散',
    note1: '提昇 5 點悟性',
    note2: '贊助<<寒江湖>>\n每個角色使用上限為 4 次',
    strength: '',
    intellect: '20',
    constitution: '',
    agility: '',
  },
  {
    item: '八脈聚神丹',
    note1: '提昇 5 點根骨',
    note2: '贊助<<寒江湖>>\n每個角色使用上限為 4 次',
    strength: '',
    intellect: '',
    constitution: '20',
    agility: '',
  },
  {
    item: '玲瓏七巧丹',
    note1: '提昇 5 點身法',
    note2: '贊助<<寒江湖>>\n每個角色使用上限為 4 次',
    strength: '',
    intellect: '',
    constitution: '',
    agility: '20',
  },
  {
    item: '基本拳腳',
    note1: '每提升 10 級皆可增加 1 點臂力',
    note2: '上限 2000 級',
    strength: '200',
    intellect: '',
    constitution: '',
    agility: '',
  },
  {
    item: '基本內功',
    note1: '每提升 10 級皆可增加 1 點根骨',
    note2: '上限 2000 級',
    strength: '',
    intellect: '',
    constitution: '200',
    agility: '',
  },
  {
    item: '基本輕功',
    note1: '每提升 10 級皆可增加 1 點身法',
    note2: '上限 2000 級',
    strength: '',
    intellect: '',
    constitution: '',
    agility: '200',
  },
  {
    item: '讀書寫字',
    note1: '每提升 10 級皆可增加 1 點悟性',
    note2: '上限 2000 級',
    strength: '',
    intellect: '200',
    constitution: '',
    agility: '',
  },
]

const totalRow = {
  note2: '總計屬性點數',
  strength: '740',
  intellect: '270',
  constitution: '720',
  agility: '720',
}

function norm(value: string) {
  return value.trim().toLowerCase()
}

function buildNameSet(list: Array<{ name?: string | null }>) {
  const set = new Set<string>()
  for (const item of list) {
    if (typeof item?.name === 'string' && item.name.trim()) {
      set.add(norm(item.name))
    }
  }
  return set
}

const dungeonNames = buildNameSet(rawDungeons as Array<{ name?: string }>)
const manualNames = buildNameSet(rawManuals as Array<{ name?: string }>)
const questNames = buildNameSet((rawQuests as { quests?: Array<{ name?: string }> })?.quests ?? [])
const dungeonRewardLinks = new Map<string, string>([
  ['真武秘典', '/guides/dungeons#dungeon-慈航靜齋'],
  ['天樞經卷', '/guides/dungeons#dungeon-慈航靜齋'],
  ['元始真法', '/guides/dungeons#dungeon-慈航靜齋'],
  ['太清靈訣', '/guides/dungeons#dungeon-慈航靜齋'],
  ['無極大成上冊', '/guides/dungeons#dungeon-慈航靜齋'],
  ['無極大成下冊', '/guides/dungeons#dungeon-慈航靜齋'],
])
const noLinkItems = new Set(['龍龜散', '龍蛇散', '八脈聚神丹', '玲瓏七巧丹'])
const skillNameToId = new Map<string, string>()
for (const skill of rawSkills as Array<{ id?: string; name?: string }>) {
  if (typeof skill?.name === 'string' && typeof skill?.id === 'string') {
    const key = norm(skill.name)
    if (!skillNameToId.has(key)) skillNameToId.set(key, skill.id)
  }
}

function getItemHref(name: string) {
  const key = norm(name)
  if (noLinkItems.has(name)) return null
  if (name === '公共武技') return '/skills?source=公共武技'
  if (name === '九陽神功') return '/equipment/manuals#manual-manual-custom-九陽神功-1'
  if (name === '九陰神功') return '/equipment/manuals#manual-manual-custom-九陰神功-1'
  if (name === '葵花魔功') return '/equipment/manuals#manual-manual-custom-葵花魔功-1'
  if (name === '無極大成') return '/guides/dungeons#dungeon-慈航靜齋'
  const dungeonLink = dungeonRewardLinks.get(name)
  if (dungeonLink) return dungeonLink
  if (questNames.has(key)) return '/guides/quests'
  if (dungeonNames.has(key)) return '/guides/dungeons'
  if (manualNames.has(key)) return '/equipment/manuals'
  const skillId = skillNameToId.get(key)
  return skillId ? `/skills/${encodeURIComponent(skillId)}` : '/equipment/manuals'
}

export default function AttributesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-ink">屬性獲得概覽表</h1>
        <p className="text-sm text-muted">
          資料來源：Google 試算表「屬性獲得概覽表」。若表格更新，可再同步此頁。
        </p>
        <div>
          <Badge className="border border-hairline bg-surface-soft text-bodytext">共 {rows.length} 筆</Badge>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-canvas">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-surface-soft text-left text-xs text-muted">
                <th className="px-4 py-3">項目</th>
                <th className="px-4 py-3">備註欄 (一)</th>
                <th className="px-4 py-3">備註欄 (二)</th>
                <th className="px-4 py-3 text-right">臂力</th>
                <th className="px-4 py-3 text-right">悟性</th>
                <th className="px-4 py-3 text-right">根骨</th>
                <th className="px-4 py-3 text-right">身法</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const href = getItemHref(row.item)
                return (
                  <tr key={row.item} className="border-t border-hairline-soft">
                    <td className="px-4 py-3 font-medium text-ink">
                      {href ? (
                        <Link href={href} className="text-rausch hover:underline">
                          {row.item}
                        </Link>
                      ) : (
                        row.item
                      )}
                    </td>
                  <td className="px-4 py-3 whitespace-pre-line text-bodytext">{row.note1}</td>
                  <td className="px-4 py-3 whitespace-pre-line text-bodytext">{row.note2}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.strength || '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.intellect || '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.constitution || '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.agility || '—'}</td>
                  </tr>
                )
              })}
              <tr className="border-t border-hairline bg-surface-soft text-sm font-semibold">
                <td className="px-4 py-3" colSpan={2}></td>
                <td className="px-4 py-3 text-muted">{totalRow.note2}</td>
                <td className="px-4 py-3 text-right tabular-nums">{totalRow.strength}</td>
                <td className="px-4 py-3 text-right tabular-nums">{totalRow.intellect}</td>
                <td className="px-4 py-3 text-right tabular-nums">{totalRow.constitution}</td>
                <td className="px-4 py-3 text-right tabular-nums">{totalRow.agility}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted">註釋：轉生疊加數據不計算在內。</p>
    </div>
  )
}
