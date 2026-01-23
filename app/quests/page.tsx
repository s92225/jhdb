// app/quests/page.tsx
import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import { getSkills } from '@/lib/data'
import type { Skill } from '@/lib/types'

type IntegratedQuest = {
  id: string
  name: string
  category?: string
  summary?: string | string[]
  giver?: string
  location?: string
  requirements?: { text: string }[] | string[]
  rewards?: { text: string }[] | string[]
  steps?: { text: string }[] | string[]
  versionNotes?: { date?: string; file?: string; note?: string }[]
  sourceRefs?: { file?: string; excerpt?: string }[]
}

type IntegratedRoot = {
  meta?: any
  quests?: IntegratedQuest[]
}

function readIntegratedQuests(): { quests: IntegratedQuest[]; error?: string } {
  const p = path.join(process.cwd(), 'data', 'quests_integrated.json')
  if (!fs.existsSync(p)) return { quests: [], error: `找不到檔案：data/quests_integrated.json` }

  try {
    let raw = fs.readFileSync(p, 'utf-8')

    // 防 BOM / 空白
    raw = raw.replace(/^\uFEFF/, '').trim()

    if (!raw) {
      return { quests: [], error: `data/quests_integrated.json 是空的（len=0）。請確認你有完整貼上 JSON。` }
    }

    const parsed = JSON.parse(raw) as IntegratedRoot | IntegratedQuest[]
    if (Array.isArray(parsed)) return { quests: parsed }
    if (Array.isArray((parsed as IntegratedRoot)?.quests)) return { quests: (parsed as IntegratedRoot).quests! }

    return { quests: [], error: `data/quests_integrated.json 格式不符：需要是 [] 或 { quests: [] }` }
  } catch (e: any) {
    return {
      quests: [],
      error:
        `解析 data/quests_integrated.json 失敗：${e?.message ?? String(e)}\n` +
        `常見原因：檔案被截斷、少了結尾括號、或有多餘逗號。`,
    }
  }
}

function safeArr(v: any): any[] {
  return Array.isArray(v) ? v : []
}

function toTextLines(v: any): string[] {
  if (!v) return []
  if (Array.isArray(v)) {
    const out: string[] = []
    for (const it of v) {
      if (typeof it === 'string') {
        const t = it.trim()
        if (t) out.push(t)
      } else if (it && typeof it === 'object' && typeof it.text === 'string') {
        const t = it.text.trim()
        if (t) out.push(t)
      }
    }
    return out
  }
  if (typeof v === 'string') {
    const t = v.trim()
    return t ? [t] : []
  }
  return []
}

function norm(s: string) {
  return (s ?? '').replace(/\u3000/g, ' ').replace(/\s+/g, ' ').trim()
}

function buildSkillNameMap(skills: Skill[]) {
  const map = new Map<string, string>()
  for (const s of skills) {
    const name = norm((s as any)?.name ?? '')
    const id = norm((s as any)?.id ?? '')
    if (!name || !id) continue
    if (!map.has(name)) map.set(name, id)
  }
  return map
}

function renderMaybeSkillLink(text: string, skillNameToId: Map<string, string>) {
  const t = norm(text)
  if (!t) return null

  const exactId = skillNameToId.get(t)
  if (exactId) {
    return (
      <Link className="text-blue-700 hover:underline" href={`/skills/${encodeURIComponent(exactId)}`}>
        {t}
      </Link>
    )
  }

  if (t.endsWith('秘笈')) {
    const base = norm(t.slice(0, -2))
    const id = skillNameToId.get(base)
    if (id) {
      return (
        <>
          <Link className="text-blue-700 hover:underline" href={`/skills/${encodeURIComponent(id)}`}>
            {base}
          </Link>
          <span>秘笈</span>
        </>
      )
    }
  }

  return <span>{text}</span>
}

function badgeClass(cat: string) {
  const c = norm(cat)
  if (c.includes('新手')) return 'bg-emerald-50 text-emerald-800 border-emerald-200'
  if (c.includes('門派')) return 'bg-indigo-50 text-indigo-800 border-indigo-200'
  if (c.includes('城市')) return 'bg-amber-50 text-amber-800 border-amber-200'
  if (c.includes('陣營')) return 'bg-rose-50 text-rose-800 border-rose-200'
  if (c.includes('練功')) return 'bg-sky-50 text-sky-800 border-sky-200'
  if (c.includes('轉生')) return 'bg-purple-50 text-purple-800 border-purple-200'
  return 'bg-gray-50 text-gray-800 border-gray-200'
}

function Badge({ children, cls }: { children: React.ReactNode; cls: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${cls}`}>{children}</span>
}

function TabLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={[
        'rounded-full border px-3 py-1 text-sm hover:bg-gray-50',
        active ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-900' : 'bg-white text-gray-800 border-gray-200',
      ].join(' ')}
    >
      {label}
    </Link>
  )
}

export default async function QuestsPage({
  searchParams,
}: {
  searchParams?: { cat?: string; view?: 'table' | 'cards' }
}) {
  const { quests: all, error } = readIntegratedQuests()

  const skills = (await getSkills()) as Skill[]
  const skillNameToId = buildSkillNameMap(skills)

  const cat = norm(searchParams?.cat ?? '全部')
  const view = searchParams?.view === 'cards' ? 'cards' : 'table'

  // 如果 JSON 壞掉，給你可讀的錯誤頁，不要直接 500
  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-gray-900">任務流程</h1>
        <div className="mt-4 rounded-2xl border bg-white p-5">
          <div className="text-sm font-medium text-red-700">quests_integrated.json 讀取失敗</div>
          <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-red-50 p-3 text-xs text-red-800">
            {error}
          </pre>
          <div className="mt-3 text-sm text-gray-700">
            建議你在專案根目錄跑：
            <pre className="mt-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-800">
              node -e "const fs=require('fs'); const t=fs.readFileSync('data/quests_integrated.json','utf8'); console.log('len=',t.length); JSON.parse(t); console.log('JSON OK');"
            </pre>
          </div>
        </div>
      </div>
    )
  }

  const cats = Array.from(
    new Set(all.map((q) => norm(q.category ?? '其他') || '其他').filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, 'zh-Hant'))

  const filtered = all
    .filter((q) => {
      const qc = norm(q.category ?? '其他') || '其他'
      if (cat === '全部') return true
      return qc === cat
    })
    .sort((a, b) => {
      const ac = norm(a.category ?? '其他') || '其他'
      const bc = norm(b.category ?? '其他') || '其他'
      if (ac !== bc) return ac.localeCompare(bc, 'zh-Hant')
      return norm(a.name).localeCompare(norm(b.name), 'zh-Hant')
    })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">任務流程</h1>
        <p className="mt-2 text-sm text-gray-600">已整合成攻略版（網站只顯示，不推理）。缺資料就留空。</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <TabLink label="全部" href={`/quests?view=${view}`} active={cat === '全部'} />
          {cats.map((c) => (
            <TabLink key={c} label={c} href={`/quests?cat=${encodeURIComponent(c)}&view=${view}`} active={cat === c} />
          ))}
        </div>

        <div className="flex gap-2">
          <TabLink
            label="表格"
            href={`/quests?${cat === '全部' ? '' : `cat=${encodeURIComponent(cat)}&`}view=table`}
            active={view === 'table'}
          />
          <TabLink
            label="卡片"
            href={`/quests?${cat === '全部' ? '' : `cat=${encodeURIComponent(cat)}&`}view=cards`}
            active={view === 'cards'}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-gray-600">沒有符合條件的任務。</div>
      ) : view === 'table' ? (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3">分類</th>
                <th className="p-3">任務</th>
                <th className="p-3">摘要</th>
                <th className="p-3">接取</th>
                <th className="p-3">門檻</th>
                <th className="p-3">獎勵</th>
                <th className="p-3">詳情</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => {
                const qc = norm(q.category ?? '其他') || '其他'
                const summary = toTextLines(q.summary)
                const steps = toTextLines(q.steps)
                const reqs = toTextLines(q.requirements)
                const rewards = toTextLines(q.rewards)

                const giver = norm(q.giver ?? '')
                const loc = norm(q.location ?? '')
                const take = giver || loc ? [giver, loc].filter(Boolean).join(' / ') : '—'

                return (
                  <tr key={q.id} className="border-b last:border-b-0">
                    <td className="p-3 align-top">
                      <Badge cls={badgeClass(qc)}>{qc}</Badge>
                    </td>
                    <td className="p-3 align-top font-medium text-gray-900">{q.name}</td>
                    <td className="p-3 align-top text-gray-700">{summary.length ? summary[0] : '—'}</td>
                    <td className="p-3 align-top text-gray-700">{take}</td>
                    <td className="p-3 align-top text-gray-700">
                      {reqs.length ? reqs.slice(0, 2).join('；') : '—'}
                      {reqs.length > 2 ? '…' : ''}
                    </td>
                    <td className="p-3 align-top text-gray-700">
                      {rewards.length ? (
                        <ul className="space-y-1">
                          {rewards.slice(0, 2).map((r, i) => (
                            <li key={`${q.id}-rw-${i}`}>• {renderMaybeSkillLink(r, skillNameToId)}</li>
                          ))}
                          {rewards.length > 2 ? <li className="text-xs text-gray-500">•（其餘展開查看）</li> : null}
                        </ul>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 align-top">
                      <details className="rounded-lg border bg-white p-2">
                        <summary className="cursor-pointer text-sm font-medium text-gray-900">展開</summary>

                        <div className="mt-3">
                          <div className="text-sm font-medium text-gray-900">攻略步驟</div>
                          {steps.length ? (
                            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-700">
                              {steps.map((s, i) => (
                                <li key={`${q.id}-st-${i}`} className="break-words">
                                  {s}
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <div className="mt-2 text-sm text-gray-600">—</div>
                          )}
                        </div>

                        <div className="mt-3">
                          <div className="text-sm font-medium text-gray-900">門檻</div>
                          {reqs.length ? (
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                              {reqs.map((r, i) => (
                                <li key={`${q.id}-rq-${i}`}>{r}</li>
                              ))}
                            </ul>
                          ) : (
                            <div className="mt-2 text-sm text-gray-600">—</div>
                          )}
                        </div>

                        <div className="mt-3">
                          <div className="text-sm font-medium text-gray-900">獎勵</div>
                          {rewards.length ? (
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                              {rewards.map((r, i) => (
                                <li key={`${q.id}-rwfull-${i}`}>{renderMaybeSkillLink(r, skillNameToId)}</li>
                              ))}
                            </ul>
                          ) : (
                            <div className="mt-2 text-sm text-gray-600">—</div>
                          )}
                        </div>

                        <div className="mt-3">
                          <details className="rounded-lg border bg-gray-50 p-2">
                            <summary className="cursor-pointer text-sm font-medium text-gray-900">來源與更新（追溯用）</summary>

                            {safeArr(q.versionNotes).length ? (
                              <div className="mt-2">
                                <div className="text-xs font-medium text-gray-700">更新</div>
                                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-gray-700">
                                  {safeArr(q.versionNotes).map((n: any, i: number) => (
                                    <li key={`${q.id}-vn-${i}`}>
                                      {(n?.date ? `${n.date} ` : '')}
                                      {n?.note ?? ''}
                                      {n?.file ? `（${n.file}）` : ''}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}

                            {safeArr(q.sourceRefs).length ? (
                              <div className="mt-2">
                                <div className="text-xs font-medium text-gray-700">來源</div>
                                <ul className="mt-1 space-y-2">
                                  {safeArr(q.sourceRefs).map((s: any, i: number) => (
                                    <li key={`${q.id}-src-${i}`} className="rounded-md border bg-white p-2">
                                      <div className="text-xs font-medium text-gray-800">{s?.file ?? '（未知檔案）'}</div>
                                      {s?.excerpt ? (
                                        <pre className="mt-1 whitespace-pre-wrap break-words text-xs text-gray-700">
                                          {s.excerpt}
                                        </pre>
                                      ) : (
                                        <div className="mt-1 text-xs text-gray-600">（無節錄）</div>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <div className="mt-2 text-xs text-gray-600">（無來源節錄）</div>
                            )}
                          </details>
                        </div>
                      </details>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((q) => {
            const qc = norm(q.category ?? '其他') || '其他'
            const summary = toTextLines(q.summary)
            const steps = toTextLines(q.steps)
            const reqs = toTextLines(q.requirements)
            const rewards = toTextLines(q.rewards)
            const giver = norm(q.giver ?? '')
            const loc = norm(q.location ?? '')

            return (
              <article key={q.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold text-gray-900">{q.name}</div>
                      <Badge cls={badgeClass(qc)}>{qc}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">{summary.length ? summary[0] : '—'}</div>
                    <div className="mt-2 text-xs text-gray-500">接取：{giver || loc ? [giver, loc].filter(Boolean).join(' / ') : '—'}</div>
                  </div>
                </header>

                <div className="mt-4 space-y-3">
                  <section className="rounded-xl border bg-gray-50 p-4">
                    <div className="text-sm font-medium text-gray-900">攻略步驟</div>
                    {steps.length ? (
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-700">
                        {steps.map((s, i) => (
                          <li key={`${q.id}-stc-${i}`}>{s}</li>
                        ))}
                      </ol>
                    ) : (
                      <div className="mt-2 text-sm text-gray-600">—</div>
                    )}
                  </section>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <section className="rounded-xl border p-4">
                      <div className="text-sm font-medium text-gray-900">門檻</div>
                      {reqs.length ? (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                          {reqs.map((r, i) => (
                            <li key={`${q.id}-rqc-${i}`}>{r}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-2 text-sm text-gray-600">—</div>
                      )}
                    </section>

                    <section className="rounded-xl border p-4">
                      <div className="text-sm font-medium text-gray-900">獎勵</div>
                      {rewards.length ? (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                          {rewards.map((r, i) => (
                            <li key={`${q.id}-rwc-${i}`}>{renderMaybeSkillLink(r, skillNameToId)}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-2 text-sm text-gray-600">—</div>
                      )}
                    </section>
                  </div>

                  <details className="rounded-xl border p-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-900">來源與更新（追溯用）</summary>

                    {safeArr(q.versionNotes).length ? (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-700">更新</div>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-gray-700">
                          {safeArr(q.versionNotes).map((n: any, i: number) => (
                            <li key={`${q.id}-vnc2-${i}`}>
                              {(n?.date ? `${n.date} ` : '')}
                              {n?.note ?? ''}
                              {n?.file ? `（${n.file}）` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {safeArr(q.sourceRefs).length ? (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-700">來源</div>
                        <ul className="mt-2 space-y-2">
                          {safeArr(q.sourceRefs).map((s: any, i: number) => (
                            <li key={`${q.id}-srcc2-${i}`} className="rounded-md border bg-gray-50 p-2">
                              <div className="text-xs font-medium text-gray-800">{s?.file ?? '（未知檔案）'}</div>
                              {s?.excerpt ? (
                                <pre className="mt-1 whitespace-pre-wrap break-words text-xs text-gray-700">{s.excerpt}</pre>
                              ) : (
                                <div className="mt-1 text-xs text-gray-600">（無節錄）</div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-gray-600">（無來源節錄）</div>
                    )}
                  </details>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
