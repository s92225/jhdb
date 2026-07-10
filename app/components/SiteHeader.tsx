'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { SearchEntry } from '@/lib/searchIndex'
import { SearchCommand } from './SearchCommand'

type NavLink = { href: string; label: string; match: string }

const PRIMARY_NAV: NavLink[] = [
  { href: '/skills', label: '武學', match: '/skills' },
  { href: '/guides/quests', label: '攻略', match: '/guides' },
  { href: '/equipment', label: '裝備', match: '/equipment' },
  { href: '/systems', label: '系統', match: '/systems' },
  { href: '/tools', label: '工具', match: '/tools' },
]

function isActive(pathname: string, match: string) {
  return pathname === match || pathname.startsWith(`${match}/`)
}

export function SiteHeader({ searchEntries }: { searchEntries: SearchEntry[] }) {
  const pathname = usePathname() || '/'
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-rausch hover:text-rausch"
        >
          <span aria-hidden className="text-xl">⚔️</span>
          <span>人在江湖</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-1 sm:flex">
          {PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.match)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
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

        <div className="ml-auto flex items-center gap-2">
          <SearchCommand entries={searchEntries} />
          <button
            type="button"
            aria-label="選單"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-full p-2 text-muted transition-colors hover:bg-surface-soft hover:text-ink sm:hidden"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4">
              {menuOpen ? (
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav className="border-t border-hairline-soft bg-canvas px-4 py-2 sm:hidden">
          {PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.match)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'block rounded-lg px-3 py-2.5 text-sm font-medium',
                  active ? 'bg-surface-strong text-ink' : 'text-bodytext hover:bg-surface-soft',
                ].join(' ')}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      ) : null}
    </header>
  )
}
