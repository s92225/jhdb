'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import type { SearchEntry } from '@/lib/searchIndex'
import { SearchCommand } from './SearchCommand'

const NAV = [
  { href: '/skills', label: '武學' },
  { href: '/guides/quests', label: '攻略' },
  { href: '/equipment', label: '裝備' },
  { href: '/systems', label: '系統' },
  { href: '/tools', label: '工具' },
  { href: '/updates', label: '更新' },
]

/** Keep the approved homepage identity separate from unrelated inner-page work. */
export function WuxiaHomeShell({ children, searchEntries }: { children: React.ReactNode; searchEntries: SearchEntry[] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); toggle.current?.focus() }
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [menuOpen])

  return <div className="wuxia-site-skin wuxia-home-skin flex min-h-screen flex-col">
    <a href="#main-content" className="skip-link">跳至主要內容</a>
    <header className="site-header">
      <div className="site-frame header-row">
        <Link href="/" className="brand" aria-label="JHDB 人在江湖資料庫首頁"><span className="wuxia-brand-seal" aria-hidden="true">江湖</span><span className="wuxia-brand-name">人在江湖資料庫</span></Link>
        <nav className="desktop-nav" aria-label="主導覽">{NAV.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
        <div className="header-actions"><SearchCommand entries={searchEntries} /><button ref={toggle} type="button" aria-label={menuOpen ? '關閉選單' : '開啟選單'} aria-expanded={menuOpen} aria-controls="home-mobile-nav" onClick={() => setMenuOpen(!menuOpen)} className="menu-toggle">{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button></div>
      </div>
      {menuOpen && <nav id="home-mobile-nav" className="mobile-nav site-frame" aria-label="手機主導覽">{NAV.map(item => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}<span aria-hidden="true">↗</span></Link>)}</nav>}
    </header>
    <main id="main-content" className="flex-1">{children}</main>
    <footer className="wuxia-footer"><div className="wuxia-frame">
      <div className="wuxia-footer-top"><Link className="wuxia-footer-name" href="/">人在江湖資料庫</Link><nav aria-label="頁尾常用連結"><Link href="/skills/compare">武技比較</Link><Link href="/tools/dazuo">打坐計算</Link><Link href="/guides/quests">任務攻略</Link></nav></div>
      <div className="wuxia-footer-bottom"><p>非官方玩家資料庫。未確認數據留白，實際規則以官方及遊戲內為準。</p><a href="https://eokatok.mystrikingly.com/" target="_blank" rel="noreferrer">寒江湖官方網站 ↗</a></div>
      <details className="wuxia-credits"><summary>插畫與字體來源</summary><p>首頁水墨插畫為 JHDB 以 AI 輔助製作，並非遊戲畫面。</p><p>標題採用 <a href="https://github.com/google/fonts/tree/main/ofl/yujiboku" target="_blank" rel="noreferrer">Yuji Boku</a> 字體子集，© 2021 The Yuji Project Authors，<a href="/fonts/Yuji-Boku-OFL.txt">SIL Open Font License 1.1</a>。功能文字採用 <a href="/fonts/NotoSansTC-OFL.txt">Noto Sans TC</a>。</p></details>
      <p className="wuxia-copyright">© 2026 JHDB · 人在江湖資料庫</p>
    </div></footer>
  </div>
}
