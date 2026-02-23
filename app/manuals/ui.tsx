'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type Manual = any

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

function Badge({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        className
      )}
    >
      {children}
    </span>
  )
}

function KV({
  label,
  value,
}: {
  label: string
  value?: string | null | undefined
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
        {value && String(value).trim() ? value : '—'}
      </div>
    </div>
  )
}

export function ManualCard({
  manual,
  defaultExpanded = false,
  skillHref,
}: {
  manual: Manual
  defaultExpanded?: boolean
  /** 對應武技詳情頁（例如 /skills/skill-... ） */
  skillHref?: string
}) {
  const [open, setOpen] = useState<boolean>(defaultExpanded)

  const name = (manual?.name ?? manual?.title ?? '（未命名）') as string
  const source = (manual?.sourceFile ?? manual?.source ?? '') as string

  const obtainText = (manual?.obtain as string) || ''
  const reqRawText = (manual?.learnRequirementsText as string) || ''
  const reqSummary = (manual?.requirementsSummary as string) || ''
  const rawExcerpt = (manual?.rawExcerpt ?? '') as string

  const anchorId = manual?.id ? `manual-${String(manual.id)}` : undefined

  return (
    <div id={anchorId} className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {skillHref ? (
              <Link
                href={skillHref}
                className="text-lg font-semibold text-slate-900 hover:underline"
              >
                {name}
              </Link>
            ) : (
              <div className="text-lg font-semibold text-slate-900">{name}</div>
            )}

            {source ? (
              <Badge className="bg-slate-50 text-slate-700 ring-slate-200">
                來源：{source}
              </Badge>
            ) : null}
          </div>

          <div className="mt-1 text-sm text-slate-600">
            整理版：優先顯示門檻與取得線索，來源可展開追溯。
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-xl border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {open ? '收起' : '展開'}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <KV label="取得方式線索" value={obtainText} />
        <KV label="學習要求（原文）" value={reqRawText} />
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-3">
        <div className="text-xs font-medium text-slate-600">學習門檻（摘要）</div>
        <div className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
          {reqSummary ? reqSummary : '—'}
        </div>
      </div>

      {open ? (
        <div className="mt-3">
          <details className="rounded-xl border bg-white p-3">
            <summary className="cursor-pointer text-sm font-medium text-slate-700">
              顯示原文片段（追溯用）
            </summary>
            <div className="mt-2 whitespace-pre-wrap text-xs text-slate-700">
              {rawExcerpt ? rawExcerpt : '（無）'}
            </div>
          </details>
        </div>
      ) : null}
    </div>
  )
}
