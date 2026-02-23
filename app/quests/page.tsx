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

  // structured fields (best effort)
  accept?: string[] // 接取方式
  requirements?: string[] // 門檻/條件
  rewards?: string[] // 獎勵
  workflow?: string[] // 流程
  notes?: string[] // 其他補充
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">任務流程</h1>
        <p className="mt-2 text-sm text-gray-600">
          整理版：把多個文件的描述整合成同一筆任務資料；缺資料顯示「未提及／—」。
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Badge className="bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200 border-none">
            共 {Array.isArray(quests) ? quests.length : 0} 筆
          </Badge>
          <Link className="text-blue-600 hover:underline" href="/dungeons">
            → 看副本
          </Link>
          <Link className="text-blue-600 hover:underline" href="/skills">
            → 看武技
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {Array.isArray(quests) && quests.length > 0 ? (
          quests.map((q) => {
            const category = (q.category || '').trim() || '未分類'
            const accept = arr(q.accept)
            const requirements = arr(q.requirements)
            const rewards = arr(q.rewards)
            const workflow = arr(q.workflow)
            const notes = arr(q.notes)
            const sources = Array.isArray(q.sourceFiles) ? q.sourceFiles.filter(Boolean) : []

            return (
              <div key={q.id} className="rounded-2xl border bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-100">{category}</Badge>
                      <h2 className="truncate text-lg font-semibold text-gray-900">{q.name}</h2>
                    </div>
                    {q.summary ? <p className="mt-2 text-sm text-gray-700">{q.summary}</p> : null}
                  </div>

                  {sources.length > 0 ? (
                    <div className="shrink-0 text-xs text-gray-500">
                      來源：{sources.slice(0, 3).join('、')}
                      {sources.length > 3 ? '…' : ''}
                    </div>
                  ) : (
                    <div className="shrink-0 text-xs text-gray-400">來源：—</div>
                  )}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <section className="rounded-xl bg-gray-50 p-4">
                    <h3 className="text-sm font-semibold text-gray-900">接取方式</h3>
                    {accept.length ? (
                      <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-700">
                        {accept.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-gray-400">未提及</p>
                    )}
                  </section>

                  <section className="rounded-xl bg-gray-50 p-4">
                    <h3 className="text-sm font-semibold text-gray-900">門檻</h3>
                    {requirements.length ? (
                      <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-700">
                        {requirements.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-gray-400">未提及</p>
                    )}
                  </section>

                  <section className="rounded-xl bg-gray-50 p-4">
                    <h3 className="text-sm font-semibold text-gray-900">獎勵</h3>
                    {rewards.length ? (
                      <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-700">
                        {rewards.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-gray-400">未提及</p>
                    )}
                  </section>

                  <section className="rounded-xl bg-gray-50 p-4">
                    <h3 className="text-sm font-semibold text-gray-900">流程</h3>
                    {workflow.length ? (
                      <ol className="mt-2 list-decimal list-inside space-y-1 text-sm text-gray-700">
                        {workflow.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="mt-2 text-sm text-gray-400">未提及</p>
                    )}
                  </section>
                </div>

                {notes.length ? (
                  <div className="mt-4 rounded-xl border bg-white p-4">
                    <div className="text-sm font-semibold text-gray-900">備註</div>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-700">
                      {notes.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {q.weapons ? <WeaponsSection weapons={q.weapons} /> : null}
              </div>
            )
          })
        ) : (
          <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">目前沒有任務資料。</div>
        )}
      </div>
    </div>
  )
}

