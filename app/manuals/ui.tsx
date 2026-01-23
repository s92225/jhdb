'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

// 允許在 client 端用名稱對照 skill id（資料量小：目前 100 多筆）
import skillsData from '@/data/skills.json'

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

function normalizeNameForMatch(s: string) {
  return safeStr(s).trim()
}

function isNumberLike(v: any) {
  return typeof v === 'number' && Number.isFinite(v)
}

function extractNumberFromText(text: string) {
  // 找第一個整數（例如 "內力 7000" / "需基本刀法 700"）
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
  const t = safeStr(text)
  return /內力/.test(t)
}

function looksLikeEnergy(text: string) {
  const t = safeStr(text)
  return /精力/.test(t)
}

function looksLikeBasicSkill(text: string) {
  const t = safeStr(text)
  // 常見：基本刀法/基本劍法/基本拳腳/基本棍法/基本短兵/基本輕功...
  return /基本/.test(t)
}

function looksLikeObtain(text: string) {
  const t = safeStr(text)
  return /(獲取|取得|掉落|擊斃|擊敗|可.*獲取|可.*取得|獎勵|副本|NPC|購買)/.test(t)
}

function findSkillIdByName(name: string): string | null {
  const n = normalizeNameForMatch(name)
  if (!n) return null

  const skills = Array.isArray(skillsData) ? (skillsData as AnyObj[]) : []
  // 先精準 match name
  const exact = skills.find((s) => normalizeNameForMatch(s?.name) === n)
  if (exact?.id) return exact.id as string

  // 再 fallback：有些 manual 名稱可能包含括號/前綴
  const loose = skills.find((s) => normalizeNameForMatch(s?.name).includes(n) || n.includes(normalizeNameForMatch(s?.name)))
  if (loose?.id) return loose.id as string

  return null
}

function buildManualSkillHref(manual: AnyObj) {
  // 你想要的正確 link：/skills/<skillId>
  const skillId = safeStr(manual?.skillId).trim()
  if (skillId) return `/skills/${encodeURIComponent(skillId)}`

  // 兼容你目前 manuals.json：只有 name，沒有 skillId 時用 name 去找
  const byName = findSkillIdByName(safeStr(manual?.name))
  if (byName) return `/skills/${encodeURIComponent(byName)}`

  // 最後退回舊查詢（不理想，但至少不會死）
  const q = encodeURIComponent(safeStr(manual?.name))
  return `/skills?manual=${q}`
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

  // 依你指定順序：內力/精力 > 基本武學 > 其他
  return [buckets.inner, buckets.energy, buckets.basic, buckets.other].filter((b) => b.items.length > 0)
}

function pickObtainText(manual: AnyObj) {
  // 兼容兩種資料格式
  // 1) manual.obtain / manual.acquisition / manual.obtainText
  // 2) requirements 內可能夾著 “可擊斃…獲取”
  const direct =
    safeStr(manual?.obtain) ||
    safeStr(manual?.acquisition?.requirements) ||
    safeStr(manual?.acquisition?.notes) ||
    safeStr(manual?.obtainText)
  if (direct.trim()) return direct.trim()

  const reqs = (manual?.requirements ?? manual?.reqs ?? []) as RequirementItem[]
  const obtainLines = (reqs || [])
    .map((r) => getReqText(r))
    .filter((t) => t && looksLikeObtain(t))

  // 取最多 3 行避免太吵
  return obtainLines.slice(0, 3).join('\n').trim()
}

function pickRawLearnText(manual: AnyObj) {
  // 兼容：learnRequirementsText / learningRequirements / requirements raw
  const t =
    safeStr(manual?.learnRequirementsText) ||
    safeStr(manual?.learningRequirements) ||
    safeStr(manual?.learningRequirementsText)
  return t.trim() || ''
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
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-600">{title}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{t || '—'}</div>
    </div>
  )
}

export function ManualCard({
  manual,
  defaultExpanded = false,
}: {
  manual: any
  defaultExpanded?: boolean
}) {
  const m = (manual || {}) as AnyObj
  const name = safeStr(m.name) || '（未命名）'
  const source = safeStr(m.sourceFile || m.rawSource || m.source) || ''
  const rawExcerpt = safeStr(m.rawExcerpt || m.raw) || ''

  const requirementsRaw = (m.requirements ?? []) as RequirementItem[]
  const buckets = useMemo(() => bucketizeRequirements(requirementsRaw), [requirementsRaw])

  // 摘要：只在卡片頂部顯示（第一眼看到 B）
  const summaryBadges = useMemo(() => {
    // 只取每桶前 1 個代表，並把數字抽出來顯示
    const out: Array<{ label: string; value?: number | null; cls: string }> = []
    for (const b of buckets) {
      const first = b.items[0]
      // 若內力/精力桶存在，但第一項沒抽到數字，仍顯示 “內力” 但不顯示數字
      out.push({ label: b.title, value: first?.value ?? null, cls: b.colorClass })
    }
    return out
  }, [buckets])

  const obtainText = useMemo(() => pickObtainText(m), [m])
  const learnRawText = useMemo(() => pickRawLearnText(m), [m])

  const skillHref = useMemo(() => buildManualSkillHref(m), [m])

  // 展開/收合（只展開前 2 筆由 page.tsx 傳 defaultExpanded）
  const [open, setOpen] = useState<boolean>(!!defaultExpanded)

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={skillHref}
              className="truncate text-lg font-semibold text-slate-900 hover:underline"
              onClick={(e) => {
                // 讓標題點擊跳轉技能頁；如果你想「點卡片展開、點標題跳轉」就避免冒泡
                e.stopPropagation()
              }}
              title={`前往武技：${name}`}
            >
              {name}
            </Link>

            {summaryBadges.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {summaryBadges.map((b, idx) => (
                  <Badge key={idx} className={`${b.cls}`}>
                    {b.label}
                    {typeof b.value === 'number' ? ` ${b.value}` : ''}
                  </Badge>
                ))}
              </div>
            ) : (
              <Badge className="bg-slate-50 text-slate-600 ring-slate-200">門檻：—</Badge>
            )}
          </div>

          <div className="mt-1 text-sm text-slate-600">
            {open ? '點擊收合' : '點擊展開'}
          </div>
        </div>

        <div className="shrink-0 text-xs text-slate-500">
          {source ? <span>來源：{source}</span> : <span>&nbsp;</span>}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="grid gap-3 md:grid-cols-2">
            <TextBlock title="取得方式線索" text={obtainText || m?.acquisition?.notes || m?.acquisition?.requirements || null} />
            <TextBlock title="學習要求（原文）" text={learnRawText || null} />
          </div>

          <div className="mt-3 rounded-lg bg-white">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs font-medium text-slate-600">學習門檻（摘要）</div>

              {buckets.length === 0 ? (
                <div className="mt-2 text-sm text-slate-900">—</div>
              ) : (
                <div className="mt-2 space-y-3">
                  {buckets.map((b) => (
                    <div key={b.key} className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge className={b.colorClass}>{b.title}</Badge>
                          <span className="text-xs text-slate-500">
                            {b.items.length} 項
                          </span>
                        </div>

                        {/* 右側小提示：有數值才顯示最大/最小 */}
                        <div className="text-xs text-slate-500">
                          {(() => {
                            const nums = b.items.map((x) => x.value).filter((x) => typeof x === 'number') as number[]
                            if (!nums.length) return null
                            const max = Math.max(...nums)
                            return <span>最高：{max}</span>
                          })()}
                        </div>
                      </div>

                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-900">
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
          </div>

          {/* 原文片段：預設收合，避免干擾 */}
          <details className="mt-3">
            <summary className="cursor-pointer select-none text-sm text-slate-600 hover:text-slate-900">
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
