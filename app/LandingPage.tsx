'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react'
import { HeroMotionPreview } from './components/HeroMotionPreview'

type UpdateItem = { id: string; date?: string | null; title?: string | null; content: string }
type Stats = { skills: number; quests: number; manuals: number; dungeons: number }

export default function LandingPage({ updates, stats }: { updates: UpdateItem[]; stats: Stats }) {
  const root = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const openSearch = (query: string) => window.dispatchEvent(new CustomEvent('jhdb:search', { detail: { query } }))
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer.unobserve(entry.target) }
      })
    }, { threshold: 0.08 })
    root.current?.querySelectorAll('[data-ink-reveal]').forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return <div className="wuxia-home" ref={root}>
    <section className="wuxia-hero" aria-labelledby="home-title">
      <figure className="wuxia-hero-art">
        <Image unoptimized priority src="/art/wuxia/hero.webp" alt="水墨江湖：青山竹影之間，一位俠客立於臨水石橋上" width={1774} height={887} sizes="100vw" />
        <HeroMotionPreview />
      </figure>
      <div className="wuxia-frame wuxia-hero-frame">
        <div className="wuxia-hero-copy">
          <h1 id="home-title"><span>人在江湖</span><span>資料庫</span></h1>
          <p className="wuxia-description">寒江湖 MUD 玩家資料庫。<br />武學、任務、秘笈與規則，一查便知。</p>
          <form className="wuxia-search" role="search" aria-label="全站資料搜尋" action="/skills" onSubmit={(event) => { event.preventDefault(); openSearch(search) }}>
            <label className="sr-only" htmlFor="home-search">搜尋人在江湖資料庫</label>
            <Search size={22} aria-hidden="true" />
            <input id="home-search" name="q" type="search" maxLength={100} autoComplete="off" enterKeyHint="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜尋武學、任務、秘笈…" />
            <button type="submit">搜尋<ArrowRight size={18} aria-hidden="true" /></button>
          </form>
          <noscript><p>搜尋需要 JavaScript；你亦可<Link href="/skills">直接瀏覽武學資料</Link>。</p></noscript>
          <div className="wuxia-search-ideas"><span>熱門搜尋</span>{['氣勢', '打坐', '九陰白骨爪'].map((word) => <button key={word} type="button" onClick={() => { setSearch(word); openSearch(word) }}>{word}</button>)}</div>
        </div>
      </div>
    </section>

    <section className="wuxia-index wuxia-frame" aria-labelledby="wuxia-index-title">
      <div className="wuxia-section-intro"><h2 id="wuxia-index-title" data-ink-reveal>江湖藏卷</h2><p data-ink-reveal>想找的門道，都在這裡。</p></div>
      <div className="wuxia-index-list">
        <Link className="wuxia-index-row" href="/skills" data-ink-reveal>
          <div><h3>武學總覽</h3><span>{stats.skills} 門武技</span></div><p>按門派篩選，並排比較招式與修練門檻。</p>
          <Image unoptimized src="/art/wuxia/scrolls-thumb.webp" alt="竹亭案上的劍與卷軸" width={1448} height={1086} sizes="200px" /><ArrowUpRight size={21} aria-hidden="true" />
        </Link>
        <Link className="wuxia-index-row" href="/guides/quests" data-ink-reveal>
          <div><h3>任務攻略</h3><span>{stats.quests} 項任務 · {stats.dungeons} 個副本</span></div><p>接取條件、任務流程與迷宮路線，逐項查閱。</p>
          <Image unoptimized src="/art/wuxia/ferry-thumb.webp" alt="兩位行旅在山水渡口相逢" width={1672} height={941} sizes="200px" /><ArrowUpRight size={21} aria-hidden="true" />
        </Link>
        <Link className="wuxia-index-row" href="/equipment/manuals" data-ink-reveal>
          <div><h3>裝備秘笈</h3><span>{stats.manuals} 本秘笈</span></div><p>尋找秘笈取得線索，查閱武器與裝備資料。</p>
          <Image unoptimized src="/art/wuxia/night-thumb.webp" alt="深青色山谷中，藏於竹林之間的高塔" width={1122} height={1402} sizes="200px" /><ArrowUpRight size={21} aria-hidden="true" />
        </Link>
        <div className="wuxia-index-row wuxia-tools-row" data-ink-reveal>
          <div><h3><Link href="/tools">實用工具</Link></h3><span>少些計算，多些修練。</span></div><p>把打坐時間與人物屬性，算得更清楚。</p>
          <nav aria-label="常用江湖工具"><Link href="/tools/dazuo">打坐計算</Link><Link href="/tools/stats">屬性計算</Link><Link href="/tools/macros">按精教程</Link></nav>
        </div>
      </div>
    </section>

    <section className="wuxia-updates wuxia-frame" aria-labelledby="wuxia-updates-title">
      <div className="wuxia-updates-intro"><h2 id="wuxia-updates-title" data-ink-reveal>江湖近況</h2><p data-ink-reveal>官方公告與資料修訂，持續記錄。</p><Link className="wuxia-text-link" href="/updates" data-ink-reveal>全部更新<ArrowRight size={18} aria-hidden="true" /></Link></div>
      <div className="wuxia-update-list">{updates.slice(0, 3).map((update) => {
        const title = update.title && update.title !== update.date ? update.title : update.content.split('\n')[0].replace(/^\d+[.、]\s*/, '')
        const summary = update.content.split('\n').filter(Boolean)[0].replace(/^\d+[.、]\s*/, '')
        return <Link key={update.id} className="wuxia-update-row" href={`/updates#${update.id}`} data-ink-reveal><time>{update.date}</time><div><h3>{title}</h3>{summary !== title && <p>{summary}</p>}</div><ArrowUpRight size={18} aria-hidden="true" /></Link>
      })}<p className="wuxia-community-note">未有答案？<Link href="/forum">到江湖討論，問問同道。</Link></p></div>
    </section>
  </div>
}
