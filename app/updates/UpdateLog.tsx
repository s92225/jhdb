'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { UpdateNote } from '@/lib/types'

export function UpdateLog({ updates }: { updates: UpdateNote[] }) {
  const [q, setQ] = useState('')
  const [source, setSource] = useState('全部')
  useEffect(() => {
    const reveal = () => {
      let id: string
      try { id = decodeURIComponent(window.location.hash.slice(1)) } catch { return }
      if (!id) return
      setQ(''); setSource('全部')
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el instanceof HTMLDetailsElement) { el.open = true; el.scrollIntoView({ block: 'start' }) }
      })
    }
    reveal(); window.addEventListener('hashchange', reveal)
    return () => window.removeEventListener('hashchange', reveal)
  }, [])
  const filtered = useMemo(() => updates.filter((u) => (source === '全部' || (source === '網站' ? u.sourceFile === 'site' : u.sourceFile !== 'site')) && `${u.date} ${u.title} ${u.content}`.toLowerCase().includes(q.trim().toLowerCase())), [updates,q,source])
  return <><div className="update-toolbar"><input type="search" aria-label="搜尋更新公告" placeholder="搜尋規則、日期或關鍵字" value={q} onChange={(e) => setQ(e.target.value)} />{['全部','遊戲','網站'].map((s) => <button type="button" key={s} aria-pressed={source === s} onClick={() => setSource(s)}>{s}</button>)}</div><p className="mb-5 text-muted" aria-live="polite">顯示 {filtered.length} 則更新</p><div className="update-log">{filtered.map((u,i) => <details key={u.id} id={u.id} open={i === 0 ? true : undefined}><summary><time>{u.date || u.title || '未標日期'}</time><div><strong>{u.title && u.title !== u.date ? u.title : u.content.split('\n')[0].replace(/^\d+[.、]\s*/, '')}</strong><small>{u.sourceFile === 'site' ? '網站功能更新' : '遊戲公告整理'}</small></div><ChevronDown size={20} aria-hidden="true" /></summary><div className="update-content">{u.content}{u.sourceUrl && <div><a href={u.sourceUrl} target="_blank" rel="noreferrer">核對官方原文 ↗</a><p className="text-muted">核對日期：{u.verifiedAt}</p></div>}</div></details>)}{filtered.length === 0 && <p className="p-8 bg-surface-soft">沒有符合的公告，試試其他關鍵字。</p>}</div></>
}
