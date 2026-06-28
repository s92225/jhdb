'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type NavLink = { href: string; label: string }

const PRIMARY_NAV: NavLink[] = [
  { href: '/skills', label: '武技比較' },
  { href: '/dungeons', label: '副本資訊' },
  { href: '/quests', label: '任務流程' },
  { href: '/manuals', label: '武功秘笈' },
  { href: '/updates', label: '近期更新' },
]

const OTHER_NAV: NavLink[] = [
  { href: '/masters', label: '師傅給物' },
  { href: '/attributes', label: '屬性獲得表' },
  { href: '/guides', label: '攻略圖解' },
  { href: '/weapons', label: '武器神兵' },
  { href: '/tools/dazuo', label: '打坐計算' },
  { href: '/macros', label: '按精教程' },
  { href: '/five-elements', label: '五行相生相剋系統' },
  { href: '/effect-simulator', label: '特效效果模擬器' },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteHeader() {
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const dropdownActive = OTHER_NAV.some((n) => isActive(pathname, n.href))

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-rausch hover:text-rausch"
        >
          <span aria-hidden className="text-xl">⚔️</span>
          <span>人在江湖</span>
        </Link>
        <nav className="-mx-2 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-surface-strong text-ink'
                    : 'text-muted hover:bg-surface-soft hover:text-ink',
                ].join(' ')}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div
          className="relative shrink-0"
          ref={ref}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              onFocus={() => setOpen(true)}
              aria-haspopup="menu"
              aria-expanded={open}
              className={[
                'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                dropdownActive
                  ? 'bg-surface-strong text-ink'
                  : 'text-muted hover:bg-surface-soft hover:text-ink',
              ].join(' ')}
            >
              其他資訊
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </button>
            {open ? (
              <div
                role="menu"
                className="absolute right-0 top-full w-56 overflow-hidden rounded-xl border border-hairline bg-canvas shadow-airbnb"
              >
                <ul className="py-1">
                  {OTHER_NAV.map((item) => {
                    const active = isActive(pathname, item.href)
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          role="menuitem"
                          className={[
                            'block px-4 py-2 text-sm',
                            active
                              ? 'bg-surface-strong text-ink'
                              : 'text-bodytext hover:bg-surface-soft hover:text-ink',
                          ].join(' ')}
                        >
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
