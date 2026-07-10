'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { SearchEntry } from '@/lib/searchIndex'

const GROUP_ORDER = ['頁面', '武技', '任務', '副本', '秘笈']

function scoreEntry(entry: SearchEntry, needle: string): number {
  const label = entry.label.toLowerCase()
  const keywords = (entry.keywords || '').toLowerCase()
  if (label === needle) return 100
  if (label.startsWith(needle)) return 80
  if (label.includes(needle)) return 60
  if (keywords.includes(needle)) return 30
  return 0
}

export function SearchCommand({ entries }: { entries: SearchEntry[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQ('')
      setCursor(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return []
    const scored = entries
      .map((e) => ({ e, s: scoreEntry(e, needle) }))
      .filter((x) => x.s > 0)
    scored.sort((a, b) => {
      if (b.s !== a.s) return b.s - a.s
      const ga = GROUP_ORDER.indexOf(a.e.group)
      const gb = GROUP_ORDER.indexOf(b.e.group)
      if (ga !== gb) return ga - gb
      return a.e.label.length - b.e.label.length
    })
    return scored.slice(0, 20).map((x) => x.e)
  }, [entries, q])

  const go = useCallback(
    (entry: SearchEntry) => {
      setOpen(false)
      router.push(entry.href)
    },
    [router],
  )

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (e.key === 'Enter' && results[cursor]) {
      e.preventDefault()
      go(results[cursor])
    }
  }

  useEffect(() => {
    setCursor(0)
  }, [q])

  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="搜尋（Ctrl+K）"
        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-hairline bg-canvas px-3 py-1.5 text-sm text-muted transition-colors hover:border-hairline hover:bg-surface-soft hover:text-ink"
      >
        <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">搜尋</span>
        <kbd className="hidden rounded border border-hairline-soft bg-surface-soft px-1.5 py-0.5 text-[10px] font-medium text-muted sm:inline">
          Ctrl K
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-hairline bg-canvas shadow-airbnb">
            <div className="flex items-center gap-3 border-b border-hairline-soft px-4">
              <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-muted">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="搜尋武技、任務、秘笈、副本、頁面…"
                className="w-full bg-transparent py-3.5 text-sm text-ink placeholder:text-muted focus:outline-none"
              />
              <kbd className="shrink-0 rounded border border-hairline-soft bg-surface-soft px-1.5 py-0.5 text-[10px] text-muted">
                Esc
              </kbd>
            </div>
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
              {q.trim() === '' ? (
                <div className="px-3 py-8 text-center text-sm text-muted">
                  輸入關鍵字搜尋整個資料庫
                </div>
              ) : results.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted">沒有符合的結果</div>
              ) : (
                results.map((r, i) => (
                  <button
                    key={`${r.href}-${r.label}-${i}`}
                    type="button"
                    data-active={i === cursor}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(r)}
                    className={[
                      'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm',
                      i === cursor ? 'bg-surface-soft text-ink' : 'text-bodytext',
                    ].join(' ')}
                  >
                    <span className="min-w-0 truncate font-medium">{r.label}</span>
                    <span className="shrink-0 rounded-full bg-surface-strong px-2 py-0.5 text-[11px] text-muted">
                      {r.group}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
