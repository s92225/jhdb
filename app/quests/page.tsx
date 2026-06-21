// app/quests/page.tsx
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Badge from '@/app/components/Badge'

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
  workflow?: any // 流程
  notes?: any
  // alternative schema fields
  giver?: string // 任務 NPC
  location?: string // 位置
  steps?: any // workflow alt name
  versionNotes?: Array<{ date?: string; file?: string; note?: string }>
  sourceRefs?: Array<{ file?: string; excerpt?: string }>
  weapons?: WeaponsData // 神兵資料
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
        <h3 className="text-lg font-semibold text-gray-900">神兵一覽</h3>
        <Badge className="bg-amber-50 text-amber-700 border-amber-200">
          共 {weapons.total} 把
        </Badge>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
          每把 {weapons.price.toLocaleString()} 黃金
        </Badge>
      </div>

      {/* forging rules */}
      {forging?.description ? (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          <span className="font-semibold">鑄煉規則：</span>{forging.description}
        </div>
      ) : null}

      {/* materials */}
      {materials.length > 0 ? (
        <div className="rounded-xl border bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-900">鑄煉素材</h4>
          {forging?.materialSource ? (
            <p className="mt-1 text-xs text-gray-500">{forging.materialSource}</p>
          ) : null}
          <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            {materials.map((m) => (
              <div key={m.name} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                <div className="font-semibold text-gray-800">{m.name}</div>
                <div className="text-xs text-gray-500">用於：{m.forType}</div>
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
            <div className="flex items-center gap-2 border-b bg-gray-50 px-4 py-3">
              <h4 className="text-sm font-semibold text-gray-900">{cat.type}</h4>
              <span className="text-xs text-gray-500">鑄煉素材：{cat.forgingMaterial}</span>
              <Badge className="ml-auto bg-gray-100 text-gray-600 border-gray-200 text-xs">
                {items.length} 把
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 font-medium">名稱</th>
                    <th className="px-4 py-2 font-medium text-right">攻擊力</th>
                    <th className="px-4 py-2 font-medium text-right">防御力</th>
                    <th className="px-4 py-2 font-medium text-right">攻防總和</th>
                    <th className="px-4 py-2 font-medium text-center">可鑄煉</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((w) => (
                    <tr key={w.name} className={w.forgeable ? 'bg-amber-50/40' : ''}>
                      <td className="px-4 py-2 font-medium text-gray-900">{w.name}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-gray-700">{w.attack}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-gray-700">{w.defense}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold text-gray-800">{w.attack + w.defense}</td>
                      <td className="px-4 py-2 text-center">
                        {w.forgeable ? (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-300">
                            可鑄煉
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
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
          <div className="rounded-xl border border-amber-300 bg-amber-50 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-100/60 px-4 py-3">
              <h4 className="text-sm font-semibold text-amber-900">鑄煉後神兵（真神兵）</h4>
              <Badge className="ml-auto bg-amber-200 text-amber-900 border-amber-300 text-xs">
                {upgraded.length} 把
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-amber-100/40 text-amber-800">
                  <tr>
                    <th className="px-4 py-2 font-medium">鑄煉後名稱</th>
                    <th className="px-4 py-2 font-medium text-right">攻擊力</th>
                    <th className="px-4 py-2 font-medium text-right">防御力</th>
                    <th className="px-4 py-2 font-medium text-right">攻防總和</th>
                    <th className="px-4 py-2 font-medium">原始神兵</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {upgraded.map((w) => (
                    <tr key={w.name + w.original}>
                      <td className="px-4 py-2 font-semibold text-amber-900">{w.name}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-amber-800">{w.attack}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-amber-800">{w.defense}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold text-amber-900">{w.attack + w.defense}</td>
                      <td className="px-4 py-2 text-sm text-amber-700">{w.original}</td>
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
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">任務流程</h1>
          <p className="mt-2 text-sm text-gray-600">整合版資料讀取失敗（本頁不會讓站台 500）。</p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-medium text-red-700">quests_integrated.json 讀取失敗</div>
          <div className="mt-2 text-sm text-gray-700 break-words">{error}</div>
          <div className="mt-4 text-sm text-gray-500">
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

  const list = Array.isArray(quests) ? quests : []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">任務流程</h1>
          <Badge className="bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200 border-none">
            共 {list.length} 筆
          </Badge>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          多個更新文件中的任務資料整合呈現；每筆任務的{' '}
          <span className="font-semibold text-gray-800">接取地點 / 門檻 / 獎勵 / 流程</span>{' '}
          以視覺化卡片呈現，可展開「版本紀錄」與「原文出處」對照來源。
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Link className="text-blue-600 hover:underline" href="/dungeons">
            → 看副本
          </Link>
          <Link className="text-blue-600 hover:underline" href="/skills">
            → 看武技
          </Link>
        </div>
      </div>

      <div className="space-y-5">
        {list.length > 0 ? (
          list.map((q) => <QuestCard key={q.id} q={q} />)
        ) : (
          <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
            目前沒有任務資料。
          </div>
        )}
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
  const workflow = arr(q.workflow ?? q.steps)
  const notes = arr(q.notes)
  const versionNotes = Array.isArray(q.versionNotes) ? q.versionNotes : []
  const sourceRefs = Array.isArray(q.sourceRefs) ? q.sourceRefs : []

  const sources = Array.isArray(q.sourceFiles)
    ? q.sourceFiles.filter(Boolean)
    : sourceRefs.map((s) => s.file).filter(Boolean) as string[]

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Header strip */}
      <header className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-blue-50 text-blue-700 border-blue-100">{category}</Badge>
          {q.giver ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-200">
              <span aria-hidden>🧑</span> {q.giver}
            </span>
          ) : null}
          {q.location ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <span aria-hidden>📍</span> {q.location}
            </span>
          ) : null}
          <h2 className="ml-1 text-lg font-semibold text-gray-900">{q.name}</h2>

          {sources.length > 0 ? (
            <span className="ml-auto text-xs text-gray-400">
              來源：{sources.slice(0, 3).join('、')}
              {sources.length > 3 ? '…' : ''}
            </span>
          ) : null}
        </div>
        {q.summary ? (
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{q.summary}</p>
        ) : null}
      </header>

      <div className="p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Section
            title="接取方式"
            icon="🚩"
            tone="indigo"
            items={accept}
            emptyHint="未提及"
          />
          <Section
            title="門檻"
            icon="🔒"
            tone="rose"
            items={requirements}
            emptyHint="無門檻"
          />
          <Section
            title="獎勵"
            icon="🎁"
            tone="amber"
            items={rewards}
            emptyHint="未提及"
          />
          <Section
            title="流程"
            icon="🧭"
            tone="emerald"
            items={workflow}
            ordered
            emptyHint="未提及"
          />
        </div>

        {notes.length ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="text-sm font-semibold text-amber-900">備註</div>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-900/90">
              {notes.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Version notes timeline */}
        {versionNotes.length ? (
          <details className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <summary className="cursor-pointer select-none text-sm font-semibold text-gray-900">
              版本紀錄（{versionNotes.length}）
            </summary>
            <ol className="mt-3 space-y-2 border-l-2 border-gray-200 pl-4 text-sm">
              {versionNotes.map((v, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 inline-block h-2.5 w-2.5 rounded-full bg-blue-400 ring-2 ring-white" />
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {v.date ? <span className="font-mono">{v.date}</span> : null}
                    {v.file ? (
                      <span className="rounded bg-gray-200/70 px-1.5 py-0.5 text-[10px] text-gray-700">
                        {v.file}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 text-sm text-gray-800">{v.note || '—'}</div>
                </li>
              ))}
            </ol>
          </details>
        ) : null}

        {/* Source refs */}
        {sourceRefs.length ? (
          <details className="mt-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <summary className="cursor-pointer select-none text-sm font-semibold text-gray-900">
              原文出處（{sourceRefs.length}）
            </summary>
            <div className="mt-3 space-y-3">
              {sourceRefs.map((s, i) => (
                <div key={i} className="rounded-lg bg-gray-50 px-3 py-2">
                  {s.file ? (
                    <div className="text-[11px] font-mono text-gray-500">{s.file}</div>
                  ) : null}
                  <pre className="mt-1 whitespace-pre-wrap font-sans text-xs leading-relaxed text-gray-700">
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

// Pretty section with icon + colored accent
type Tone = 'indigo' | 'rose' | 'amber' | 'emerald'
const TONE: Record<Tone, { bg: string; ring: string; text: string }> = {
  indigo: { bg: 'bg-indigo-50/70', ring: 'ring-indigo-200', text: 'text-indigo-900' },
  rose: { bg: 'bg-rose-50/70', ring: 'ring-rose-200', text: 'text-rose-900' },
  amber: { bg: 'bg-amber-50/70', ring: 'ring-amber-200', text: 'text-amber-900' },
  emerald: { bg: 'bg-emerald-50/70', ring: 'ring-emerald-200', text: 'text-emerald-900' },
}

function Section({
  title,
  icon,
  tone,
  items,
  ordered = false,
  emptyHint,
}: {
  title: string
  icon: string
  tone: Tone
  items: string[]
  ordered?: boolean
  emptyHint?: string
}) {
  const t = TONE[tone]
  const ListTag = ordered ? 'ol' : 'ul'
  return (
    <section className={`rounded-xl ${t.bg} p-4 ring-1 ring-inset ${t.ring}`}>
      <h3 className={`flex items-center gap-1.5 text-sm font-semibold ${t.text}`}>
        <span aria-hidden>{icon}</span>
        {title}
      </h3>
      {items.length ? (
        <ListTag
          className={[
            'mt-2 space-y-1 text-sm text-gray-800',
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
        <p className="mt-2 text-sm italic text-gray-400">{emptyHint ?? '未提及'}</p>
      )}
    </section>
  )
}

