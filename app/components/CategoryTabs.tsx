'use client'

import { useMemo, useState } from 'react'

export type CategorizedItem = {
  id: string
  category: string
  searchText?: string
  node: React.ReactNode
}

const ALL = '全部'

export function CategoryTabs({
  items,
  searchPlaceholder = '搜尋…',
  enableSearch = true,
  orderedCategories,
}: {
  items: CategorizedItem[]
  searchPlaceholder?: string
  enableSearch?: boolean
  orderedCategories?: string[]
}) {
  const categories = useMemo(() => {
    const set = new Set<string>()
    items.forEach((it) => set.add(it.category || '其他'))
    const arr = Array.from(set)
    if (orderedCategories && orderedCategories.length) {
      arr.sort((a, b) => {
        const ai = orderedCategories.indexOf(a)
        const bi = orderedCategories.indexOf(b)
        if (ai === -1 && bi === -1) return a.localeCompare(b, 'zh-Hant')
        if (ai === -1) return 1
        if (bi === -1) return -1
        return ai - bi
      })
    }
    return [ALL, ...arr]
  }, [items, orderedCategories])

  const [active, setActive] = useState(ALL)
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items.filter((it) => {
      if (active !== ALL && (it.category || '其他') !== active) return false
      if (!needle) return true
      return (it.searchText || '').toLowerCase().includes(needle)
    })
  }, [items, active, q])

  const counts = useMemo(() => {
    const m: Record<string, number> = { [ALL]: items.length }
    items.forEach((it) => {
      const k = it.category || '其他'
      m[k] = (m[k] || 0) + 1
    })
    return m
  }, [items])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 flex flex-wrap items-center gap-1 px-1">
          {categories.map((c) => {
            const isActive = c === active
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                className={[
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-ink text-canvas'
                    : 'bg-surface-soft text-bodytext hover:bg-surface-strong hover:text-ink',
                ].join(' ')}
              >
                {c}
                <span className={`ml-1.5 tabular-nums ${isActive ? 'text-canvas/70' : 'text-muted'}`}>
                  {counts[c] ?? 0}
                </span>
              </button>
            )
          })}
        </div>
        {enableSearch ? (
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-full border border-hairline bg-canvas px-4 py-2 text-sm text-ink placeholder:text-muted focus:border-rausch focus:outline-none focus:ring-2 focus:ring-rausch/20 sm:w-64"
          />
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-canvas p-8 text-center text-sm text-muted">
          沒有符合的結果
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((it) => (
            <div key={it.id}>{it.node}</div>
          ))}
        </div>
      )}
    </div>
  )
}
