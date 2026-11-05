'use client'

import { useId, useMemo, useState } from 'react'

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
  const searchId = useId()

  const matching = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items.filter((it) => {
      if (!needle) return true
      return (it.searchText || '').toLowerCase().includes(needle)
    })
  }, [items, q])
  const filtered = useMemo(() => matching.filter((it) => active===ALL || (it.category || '其他')===active),[matching,active])

  const counts = useMemo(() => {
    const m: Record<string, number> = { [ALL]: matching.length }
    matching.forEach((it) => {
      const k = it.category || '其他'
      m[k] = (m[k] || 0) + 1
    })
    return m
  }, [matching])

  return (
    <div className="category-browser">
      <div className="category-toolbar">
        <p className="category-results" role="status" aria-live="polite">顯示 {filtered.length} / {items.length} 筆{q.trim() ? ` · 「${q.trim()}」` : ''}</p>
        {enableSearch && <label className="category-search" htmlFor={searchId}><span className="sr-only">{searchPlaceholder}</span><input id={searchId} type="search" value={q} onChange={(e)=>setQ(e.target.value)} placeholder={searchPlaceholder} /></label>}
      </div>
      <nav className="category-tabs" aria-label="分類篩選">
          {categories.map((c) => {
            const isActive = c === active
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                aria-pressed={isActive}
              >
                {c}
                <span className="category-count">
                  {counts[c] ?? 0}
                </span>
              </button>
            )
          })}
      </nav>

      {filtered.length === 0 ? (
        <div className="category-empty"><p>沒有符合的結果。</p><button type="button" onClick={()=>{setActive(ALL);setQ('')}}>清除搜尋與分類</button></div>
      ) : (
        <div className="category-list">
          {filtered.map((it) => (
            <div key={it.id}>{it.node}</div>
          ))}
        </div>
      )}
    </div>
  )
}
