// app/quests/page.tsx
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Badge from '@/app/components/Badge'
import { CategoryTabs, type CategorizedItem } from '@/app/components/CategoryTabs'
import { DamoMaze } from '@/app/components/DamoMaze'
import { GuideHeader } from '@/app/components/GuideHeader'
import { visibleQuestEntries } from '@/lib/guide-catalog'

type WeaponItem = {
  name: string
  attack: number
  defense: number
  forgeable: boolean
  upgradedName?: string
  upgradedAttack?: number
  upgradedDefense?: number
}

type WeaponCategory = {
  type: string
  forgingMaterial: string
  items: WeaponItem[]
}

type WeaponsData = {
  total: number
  price: number
  categories: WeaponCategory[]
  forging?: {
    description?: string
    materials?: Array<{ name: string; forType: string }>
    materialSource?: string
  }
}

type IntegratedQuest = {
  id: string
  name: string
  category?: string
  sourceFiles?: string[]
  summary?: string

  // legacy / preferred fields
  accept?: any // 接取方式 (string[] | {text}[] | string)
  requirements?: any
  rewards?: any
  targets?: any
  workflow?: any // 流程
  notes?: any
  // alternative schema fields
  giver?: string // 任務 NPC
  location?: string // 位置
  steps?: any // workflow alt name
  versionNotes?: Array<{ date?: string; file?: string; note?: string }>
  sourceRefs?: Array<{ file?: string; excerpt?: string }>
  weapons?: WeaponsData // 神兵資料
  blackwoodToken?: { source: string; details: string }
}

type IntegratedRoot = { quests?: IntegratedQuest[] }

function readIntegratedQuests(): { quests: IntegratedQuest[]; error?: string } {
  try {
    const p = path.join(process.cwd(), 'data', 'quests_integrated.json')
    if (!fs.existsSync(p)) return { quests: [], error: '找不到 data/quests_integrated.json' }

    const raw = fs.readFileSync(p, 'utf-8')
    if (!raw.trim()) return { quests: [], error: 'quests_integrated.json 是空檔案' }

    const parsed = JSON.parse(raw) as IntegratedRoot | IntegratedQuest[]
    const quests = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.quests) ? parsed.quests : []
    return { quests }
  } catch (e: any) {
    return { quests: [], error: e?.message || String(e) }
  }
}

function stringifyItem(v: any): string | null {
  if (typeof v === 'string') return v.trim() || null
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : null
  if (v && typeof v === 'object') {
    const text = typeof v.text === 'string' ? v.text.trim() : ''
    if (text) return text
    const value = typeof v.value === 'string' ? v.value.trim() : ''
    if (value) return value
    return null
  }
  return null
}

function arr(v: any): string[] {
  if (Array.isArray(v)) return v.map(stringifyItem).filter(Boolean) as string[]
  const single = stringifyItem(v)
  return single ? [single] : []
}

function WeaponsSection({ weapons }: { weapons: WeaponsData }) {
  const cats = Array.isArray(weapons.categories) ? weapons.categories : []
  const forging = weapons.forging
  const materials = Array.isArray(forging?.materials) ? forging!.materials : []

  return (
    <div className="mt-6 space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-semibold text-ink">神兵一覽</h3>
        <Badge className="bg-surface-soft text-bodytext border-hairline">
          共 {weapons.total} 把
        </Badge>
        <Badge className="bg-surface-soft text-bodytext border-hairline">
          每把 {weapons.price.toLocaleString()} 黃金
        </Badge>
      </div>

      {/* forging rules */}
      {forging?.description ? (
        <div className="rounded-xl border border-hairline bg-surface-soft px-4 py-3 text-sm text-ink">
          <span className="font-semibold">鑄煉規則：</span>{forging.description}
        </div>
      ) : null}

      {/* materials */}
      {materials.length > 0 ? (
        <div className="rounded-xl border bg-surface-soft p-4">
          <h4 className="text-sm font-semibold text-ink">鑄煉素材</h4>
          {forging?.materialSource ? (
            <p className="mt-1 text-xs text-muted">{forging.materialSource}</p>
          ) : null}
          <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            {materials.map((m) => (
              <div key={m.name} className="rounded-lg border border-hairline bg-white px-3 py-2 text-sm">
                <div className="font-semibold text-ink">{m.name}</div>
                <div className="text-xs text-muted">用於：{m.forType}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* weapon tables per category */}
      {cats.map((cat) => {
        const items = Array.isArray(cat.items) ? cat.items : []
        return (
          <div key={cat.type} className="rounded-xl border bg-white overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-surface-soft px-4 py-3">
              <h4 className="text-sm font-semibold text-ink">{cat.type}</h4>
              <span className="text-xs text-muted">鑄煉素材：{cat.forgingMaterial}</span>
              <Badge className="ml-auto bg-surface-strong text-bodytext border-hairline text-xs">
                {items.length} 把
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-soft text-bodytext">
                  <tr>
                    <th className="px-4 py-2 font-medium">名稱</th>
                    <th className="px-4 py-2 font-medium text-right">攻擊力</th>
                    <th className="px-4 py-2 font-medium text-right">防御力</th>
                    <th className="px-4 py-2 font-medium text-right">攻防總和</th>
                    <th className="px-4 py-2 font-medium text-center">可鑄煉</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {items.map((w) => (
                    <tr key={w.name} className={w.forgeable ? 'bg-surface-soft' : ''}>
                      <td className="px-4 py-2 font-medium text-ink">{w.name}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-bodytext">{w.attack}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-bodytext">{w.defense}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold text-ink">{w.attack + w.defense}</td>
                      <td className="px-4 py-2 text-center">
                        {w.forgeable ? (
                          <span className="inline-flex items-center rounded-full bg-surface-strong px-2 py-0.5 text-xs font-semibold text-ink ring-1 ring-inset ring-hairline">
                            可鑄煉
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {/* upgraded weapons table */}
      {(() => {
        const upgraded = cats.flatMap((cat) =>
          (cat.items || []).filter((w) => w.forgeable && w.upgradedName).map((w) => ({
            original: w.name,
            name: w.upgradedName!,
            attack: w.upgradedAttack!,
            defense: w.upgradedDefense!,
          }))
        )
        if (!upgraded.length) return null
        return (
          <div className="rounded-xl border border-hairline bg-surface-soft overflow-hidden">
            <div className="flex items-center gap-2 border-b border-hairline bg-surface-strong px-4 py-3">
              <h4 className="text-sm font-semibold text-ink">鑄煉後神兵（真神兵）</h4>
              <Badge className="ml-auto bg-surface-strong text-ink border-hairline text-xs">
                {upgraded.length} 把
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-strong text-ink">
                  <tr>
                    <th className="px-4 py-2 font-medium">鑄煉後名稱</th>
                    <th className="px-4 py-2 font-medium text-right">攻擊力</th>
                    <th className="px-4 py-2 font-medium text-right">防御力</th>
                    <th className="px-4 py-2 font-medium text-right">攻防總和</th>
                    <th className="px-4 py-2 font-medium">原始神兵</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {upgraded.map((w) => (
                    <tr key={w.name + w.original}>
                      <td className="px-4 py-2 font-semibold text-ink">{w.name}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-ink">{w.attack}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-ink">{w.defense}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold text-ink">{w.attack + w.defense}</td>
                      <td className="px-4 py-2 text-sm text-bodytext">{w.original}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default function QuestsPage() {
  const { quests, error } = readIntegratedQuests()

  // JSON 壞掉：給可讀錯誤頁，不要直接 500
  if (error) {
    return (
      <div className="guide-page">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-ink">任務流程</h1>
          <p className="mt-2 text-sm text-bodytext">整合版資料讀取失敗（本頁不會讓站台 500）。</p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-medium text-red-700">quests_integrated.json 讀取失敗</div>
          <div className="mt-2 text-sm text-bodytext break-words">{error}</div>
          <div className="mt-4 text-sm text-muted">
            請確認：
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>檔案路徑：<code className="px-1">/data/quests_integrated.json</code></li>
              <li>JSON 格式正確（最後一行不要缺 <code className="px-1">]</code> 或 <code className="px-1">{'}'}</code>）</li>
              <li>Vercel 有抓到最新 commit</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Filter out 神兵 entry (moved to /weapons page) to avoid duplication.
  const list = visibleQuestEntries(Array.isArray(quests) ? quests : [])

  const items: CategorizedItem[] = list.map((q) => ({
    id: q.id,
    category: (q.category || '').trim() || '未分類',
    searchText: [
      q.name,
      q.summary,
      q.giver,
      q.location,
      ...(Array.isArray(q.targets) ? (q.targets as any[]).map((x) => stringifyItem(x) ?? '') : []),
      ...(Array.isArray(q.workflow) ? (q.workflow as any[]).map((x) => stringifyItem(x) ?? '') : []),
      ...(Array.isArray(q.steps) ? (q.steps as any[]).map((x) => stringifyItem(x) ?? '') : []),
    ]
      .filter(Boolean)
      .join(' '),
    node: <QuestCard q={q} />,
  }))

  return (
    <div className="guide-page">
      {/* Page header */}
      <GuideHeader title="任務流程" count={`${list.length} 項任務`} description="按門派與進度找任務，先核對門檻，再看流程與獎勵。">
          <Link href="/guides/dungeons">
            → 看副本
          </Link>
          <Link href="/skills">
            → 看武技
          </Link>
          <Link href="/equipment">
            → 神兵取得流程
          </Link>
          <a href="#dungeon-damo-maze">
            ↓ 大漠迷宮（轉生）
          </a>
      </GuideHeader>

      <CategoryTabs
        items={items}
        searchPlaceholder="搜尋任務名稱、流程…"
        orderedCategories={['新手', '新手進階', '新手/蒙古', '門派', '城市', '練功', '練功/多階段', '副本/解謎', '世界BOSS']}
      />

      <div className="mt-12 border-t border-hairline pt-10">
        <DamoMaze />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// QuestCard
// ──────────────────────────────────────────────────────────────────────────

function QuestCard({ q }: { q: IntegratedQuest }) {
  const category = (q.category || '').trim() || '未分類'

  // Schema A uses `accept` & `workflow`; schema B uses `giver`/`location` & `steps`.
  // Synthesize `accept` from giver/location when missing.
  const acceptRaw = q.accept ?? null
  let accept = arr(acceptRaw)
  if (!accept.length) {
    const fallback: string[] = []
    if (q.giver && q.giver.trim() && q.giver !== '—') fallback.push(`任務 NPC：${q.giver}`)
    if (q.location && q.location.trim() && q.location !== '—')
      fallback.push(`地點：${q.location}`)
    accept = fallback
  }

  const requirements = arr(q.requirements)
  const rewards = arr(q.rewards)
  const targets = arr(q.targets)
  const workflow = arr(q.workflow ?? q.steps)
  const notes = arr(q.notes)
  const versionNotes = Array.isArray(q.versionNotes) ? q.versionNotes : []
  const sourceRefs = Array.isArray(q.sourceRefs) ? q.sourceRefs : []

  return (
    <article className="quest-card">
      {/* Header strip */}
      <header className="quest-card-header">
        <div className="quest-meta">
          <span className="guide-tag">{category}</span>
          {q.giver ? (
            <span>接取 NPC：{q.giver}</span>
          ) : null}
          {q.location ? (
            <span>地點：{q.location}</span>
          ) : null}
        </div>
        <h2>{q.name}</h2>
        {q.summary ? (
          <p className="mt-2 text-sm leading-relaxed text-bodytext">{q.summary}</p>
        ) : null}
      </header>

      <div className="quest-card-body">
        <div className="quest-sections">
          <Section
            title="接取方式"
            tone="info"
            items={accept}
            emptyHint="未提及"
          />
          <Section
            title="門檻"
            tone="danger"
            items={requirements}
            emptyHint="無門檻"
          />
          <Section
            title="獎勵"
            tone="attention"
            items={rewards}
            emptyHint="未提及"
          />
          <Section
            title="流程"
            tone="success"
            items={workflow}
            ordered
            emptyHint="未提及"
          />
          {targets.length ? (
            <div className="md:col-span-2">
              <Section
                title="任務目標"
                tone="danger"
                items={targets}
              />
            </div>
          ) : null}
        </div>

        {q.blackwoodToken ? (
          <div className="mt-4 rounded-xl border border-hairline bg-surface-soft p-4">
            <div className="text-sm font-semibold text-ink">黑木令取得方式</div>
            <div className="mt-2 text-sm text-ink">
              <p className="font-medium">{q.blackwoodToken.source}</p>
              <p className="mt-1 text-bodytext">{q.blackwoodToken.details}</p>
            </div>
          </div>
        ) : null}

        {notes.length ? (
          <div className="mt-4 rounded-xl border border-hairline bg-surface-soft p-4">
            <div className="text-sm font-semibold text-ink">備註</div>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink">
              {notes.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Version notes timeline */}
        {versionNotes.length ? (
          <details className="mt-4 rounded-xl border border-hairline bg-surface-soft px-4 py-3">
            <summary className="cursor-pointer select-none text-sm font-semibold text-ink">
              版本紀錄（{versionNotes.length}）
            </summary>
            <ol className="mt-3 space-y-2 border-l-2 border-hairline pl-4 text-sm">
              {versionNotes.map((v, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 inline-block h-2.5 w-2.5 rounded-full bg-rausch ring-2 ring-white" />
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    {v.date ? <span className="font-sans">{v.date}</span> : null}
                  </div>
                  <div className="mt-0.5 text-sm text-ink">{v.note || '—'}</div>
                </li>
              ))}
            </ol>
          </details>
        ) : null}

        {/* Source refs */}
        {sourceRefs.length ? (
          <details className="mt-3 rounded-xl border border-hairline bg-white px-4 py-3">
            <summary className="cursor-pointer select-none text-sm font-semibold text-ink">
              原文出處（{sourceRefs.length}）
            </summary>
            <div className="mt-3 space-y-3">
              {sourceRefs.map((s, i) => (
                <div key={i} className="rounded-lg bg-surface-soft px-3 py-2">
                  <pre className="mt-1 whitespace-pre-wrap font-sans text-xs leading-relaxed text-bodytext">
                    {s.excerpt || '—'}
                  </pre>
                </div>
              ))}
            </div>
          </details>
        ) : null}

        {q.weapons ? <WeaponsSection weapons={q.weapons} /> : null}
      </div>
    </article>
  )
}

function Section({
  title,
  tone,
  items,
  ordered = false,
  emptyHint,
}: {
  title: string
  tone?: 'info' | 'attention' | 'danger' | 'success'
  items: string[]
  ordered?: boolean
  emptyHint?: string
}) {
  const ListTag = ordered ? 'ol' : 'ul'
  return (
    <section className="guide-section" data-guide-tone={tone}><h3>{title}</h3>
      {items.length ? (
        <ListTag
          className={[
            'mt-2 space-y-1 text-sm text-ink',
            ordered ? 'list-decimal' : 'list-disc',
            'pl-5',
          ].join(' ')}
        >
          {items.map((x, i) => (
            <li key={i} className="leading-relaxed">
              {x}
            </li>
          ))}
        </ListTag>
      ) : (
        <p className="mt-2 text-sm text-muted">{emptyHint ?? '未提及'}</p>
      )}
    </section>
  )
}

