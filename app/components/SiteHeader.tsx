'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import type { SearchEntry } from '@/lib/searchIndex'
import { SearchCommand } from './SearchCommand'

const PRIMARY_NAV = [
  { href: '/skills', label: '武學', match: '/skills' },
  { href: '/guides/quests', label: '攻略', match: '/guides' },
  { href: '/equipment', label: '裝備', match: '/equipment' },
  { href: '/systems', label: '系統', match: '/systems' },
  { href: '/tools', label: '工具', match: '/tools' },
  { href: '/updates', label: '更新', match: '/updates' },
  { href: '/forum', label: '討論', match: '/forum' },
]

export function SiteHeader({ searchEntries }: { searchEntries: SearchEntry[] }) {
  const pathname = usePathname() || '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => setMenuOpen(false), [pathname])
  useEffect(() => {
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape' && menuOpen) { setMenuOpen(false); toggle.current?.focus() } }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [menuOpen])
  return <header className="site-header">
    <div className="site-frame header-row">
      <Link href="/" className="brand" aria-label="JHDB 人在江湖資料庫首頁"><span className="wuxia-brand-seal" aria-hidden="true">江湖</span><span className="wuxia-brand-name">人在江湖資料庫</span></Link>
      <nav className="desktop-nav" aria-label="主導覽">{PRIMARY_NAV.map((item) => <Link key={item.href} href={item.href} aria-current={pathname.startsWith(item.match) ? 'page' : undefined}>{item.label}</Link>)}</nav>
      <div className="header-actions"><SearchCommand entries={searchEntries} /><button ref={toggle} type="button" aria-label={menuOpen ? '關閉選單' : '開啟選單'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)} className="menu-toggle">{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button></div>
    </div>
    {menuOpen && <nav id="mobile-nav" className="mobile-nav site-frame" aria-label="手機主導覽">{PRIMARY_NAV.map((item) => <Link key={item.href} href={item.href} aria-current={pathname.startsWith(item.match) ? 'page' : undefined}>{item.label}<span aria-hidden="true">↗</span></Link>)}</nav>}
  </header>
}
