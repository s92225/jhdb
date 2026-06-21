'use client'

import { useMemo, useState } from 'react'

type AnyObj = Record<string, any>

type RequirementItem =
  | { name?: string; value?: number | null; raw?: string }
  | { key?: string; label?: string; value?: number | null; raw?: string }
  | string

function safeStr(v: any) {
  if (typeof v === 'string') return v
  if (v == null) return ''
  try {
    return String(v)
  } catch {
    return ''
  }
}

function isNumberLike(v: any) {
  return typeof v === 'number' && Number.isFinite(v)
}

function extractNumberFromText(text: string) {
  const m = safeStr(text).replace(/,/g, '').match(/(\d{1,9})/)
  return m ? Number(m[1]) : null
}

function getReqText(r: any) {
  if (typeof r === 'string') return r.trim()
  if (r && typeof r === 'object') {
    const n = safeStr(r.name || r.label || r.key)
    const raw = safeStr(r.raw)
    if (n) return n.trim()
    if (raw) return raw.trim()
  }
  return ''
}

function getReqValue(r: any) {
  if (!r || typeof r !== 'object') return null
  const v = (r as any).value
  if (isNumberLike(v)) return v as number
  return null
}

function looksLikeInner(text: string) {
  return /內力/.test(safeStr(text))
}

function looksLikeEnergy(text: string) {
  return /精力/.test(safeStr(text))
}

function looksLikeBasicSkill(text: string) {
  return /基本/.test(safeStr(text))
}

type Bucket = {
  key: 'inner' | 'energy' | 'basic' | 'other'
  title: string
  colorClass: string
  items: Array<{ text: string; value?: number | null }>
}

function bucketizeRequirements(reqs: RequirementItem[]): Bucket[] {
  const buckets: Record<string, Bucket> = {
    inner: { key: 'inner', title: '內力', colorClass: 'bg-red-50 text-red-700 ring-red-200', items: [] },
    energy: { key: 'energy', title: '精力', colorClass: 'bg-amber-50 text-amber-700 ring-amber-200', items: [] },
    basic: { key: 'basic', title: '基本武學', colorClass: 'bg-blue-50 text-blue-700 ring-blue-200', items: [] },
    other: { key: 'other', title: '其他', colorClass: 'bg-slate-50 text-slate-700 ring-slate-200', items: [] },
  }

  for (const r of reqs || []) {
    const text = getReqText(r)
    if (!text) continue
    const v = getReqValue(r)
    const inferred = v ?? extractNumberFromText(text)

    if (looksLikeInner(text)) buckets.inner.items.push({ text, value: inferred })
    else if (looksLikeEnergy(text)) buckets.energy.items.push({ text, value: inferred })
    else if (looksLikeBasicSkill(text)) buckets.basic.items.push({ text, value: inferred })
    else buckets.other.items.push({ text, value: inferred })
  }

  return [buckets.inner, buckets.energy, buckets.basic, buckets.other].filter((b) => b.items.length > 0)
}

function pickText(m: AnyObj, keys: string[]) {
  for (const k of keys) {
    const v = safeStr((m as any)?.[k]).trim()
    if (v) return v
  }
  return ''
}

function pickLines(m: AnyObj, keys: string[], limit = 6) {
  for (const k of keys) {
    const v = (m as any)?.[k]
    if (Array.isArray(v)) {
      const lines = v.map((x) => safeStr(x).trim()).filter(Boolean)
      if (lines.length) return lines.slice(0, limit).join('\n')
    }
    const s = safeStr(v).trim()
    if (s) return s
  }
  return ''
}

function Badge({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
      {children}
    </span>
  )
}

function TextBlock({ title, text }: { title: string; text?: string | null }) {
  const t = safeStr(text).trim()
  return (
    <div className="rounded-lg bg-surface-soft p-3">
      <div className="text-xs font-medium text-muted">{title}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-ink">{t || '—'}</div>
    </div>
  )
}

// ---- 主要卡片元件 ----

export function DungeonCard({
  dungeon,
  defaultExpanded = false,
}: {
  dungeon: any
  defaultExpanded?: boolean
}) {
  const d = (dungeon || {}) as AnyObj

  const name = safeStr(d.name) || safeStr(d.title) || '（未命名副本）'
  const source = safeStr(d.sourceFile || d.source || d.rawSource) || ''
  const rawExcerpt = safeStr(d.rawExcerpt || d.raw) || ''

  // 常見欄位：entry / requirements / reqs / gates
  const requirementsRaw = (d.requirements ?? d.entryRequirements ?? d.entryReqs ?? d.reqs ?? d.gates ?? []) as RequirementItem[]
  const buckets = useMemo(() => bucketizeRequirements(requirementsRaw), [requirementsRaw])

  // 類型/難度/推薦等：盡量從現有欄位找，不猜
  const category = pickText(d, ['category', 'type', 'kind'])
  const difficulty = pickText(d, ['difficulty', 'diff', 'level', 'tier'])
  const location = pickText(d, ['location', 'place', 'map', 'area'])
  const recommended = pickText(d, ['recommended', 'recommend', 'suggested'])

  // 進入線索（你想要「人一眼看懂」）
  const entryClue =
    pickLines(d, ['entry', 'entryClue', 'howToEnter', 'enter', 'access', 'route'], 8) ||
    pickLines(d, ['notes', 'tips'], 6)

  // 獎勵/掉落（不猜）
  const rewards = pickLines(d, ['rewards', 'drops', 'loot', 'reward'], 10)

  // 小貼士/詳細資訊（同理）
  const tips = pickLines(d, ['tips', 'guide', 'details', 'detail'], 12)

  // 頂部摘要 badge（每桶取一個代表）
  const summaryBadges = useMemo(() => {
    if (!buckets.length) return []
    return buckets.map((b) => {
      const first = b.items[0]
      return { label: b.title, value: first?.value ?? null, cls: b.colorClass }
    })
  }, [buckets])

  const [open, setOpen] = useState<boolean>(!!defaultExpanded)

  return (
    <div className="rounded-2xl border border-hairline bg-canvas transition-shadow hover:shadow-airbnb">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-lg font-semibold text-ink" title={name}>
              {name}
            </div>

            {/* 類型/難度/地點 */}
            <div className="flex flex-wrap items-center gap-1.5">
              {category ? (
                <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">{category}</Badge>
              ) : null}
              {difficulty ? (
                <Badge className="bg-purple-50 text-purple-700 ring-purple-200">{difficulty}</Badge>
              ) : null}
              {location ? (
                <Badge className="bg-cyan-50 text-cyan-700 ring-cyan-200">{location}</Badge>
              ) : null}
              {recommended ? (
                <Badge className="bg-orange-50 text-orange-700 ring-orange-200">{recommended}</Badge>
              ) : null}
            </div>

            {/* 門檻摘要（你指定順序） */}
            {summaryBadges.length ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {summaryBadges.map((b, idx) => (
                  <Badge key={idx} className={b.cls}>
                    {b.label}
                    {typeof b.value === 'number' ? ` ${b.value}` : ''}
                  </Badge>
                ))}
              </div>
            ) : (
              <Badge className="bg-surface-soft text-muted ring-hairline">門檻：—</Badge>
            )}
          </div>

          <div className="mt-1 text-sm text-muted">{open ? '點擊收合' : '點擊展開'}</div>
        </div>

        <div className="shrink-0 text-xs text-muted-soft">
          {source ? <span>來源：{source}</span> : <span>&nbsp;</span>}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          {/* 第一層：進入/獎勵（你想要第一眼快懂） */}
          <div className="grid gap-3 md:grid-cols-2">
            <TextBlock title="進入方式 / 路線線索" text={entryClue || null} />
            <TextBlock title="獎勵 / 掉落線索" text={rewards || null} />
          </div>

          {/* 第二層：門檻摘要（分類、排序） */}
          <div className="mt-3 rounded-lg bg-surface-soft p-3">
            <div className="text-xs font-medium text-muted">門檻（摘要）</div>

            {buckets.length === 0 ? (
              <div className="mt-2 text-sm text-ink">—</div>
            ) : (
              <div className="mt-2 space-y-3">
                {buckets.map((b) => (
                  <div key={b.key} className="rounded-lg bg-canvas p-3 ring-1 ring-hairline">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className={b.colorClass}>{b.title}</Badge>
                        <span className="text-xs text-muted-soft">{b.items.length} 項</span>
                      </div>
                      <div className="text-xs text-muted-soft">
                        {(() => {
                          const nums = b.items.map((x) => x.value).filter((x) => typeof x === 'number') as number[]
                          if (!nums.length) return null
                          return <span>最高：{Math.max(...nums)}</span>
                        })()}
                      </div>
                    </div>

                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
                      {b.items.map((it, idx) => (
                        <li key={idx} className="whitespace-pre-wrap">
                          {it.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 第三層：小貼士/詳細資訊 */}
          <div className="mt-3">
            <TextBlock title="小貼士 / 詳細資訊" text={tips || null} />
          </div>

          {/* 原文片段：預設收合 */}
          <details className="mt-3">
            <summary className="cursor-pointer select-none text-sm text-muted hover:text-ink">
              顯示原文片段（追溯用）
            </summary>
            <div className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
              {rawExcerpt || '—'}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
