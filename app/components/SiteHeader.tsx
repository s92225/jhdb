'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/skills', label: '武技比較' },
  { href: '/weapons', label: '武器神兵' },
  { href: '/quests', label: '任務流程' },
  { href: '/manuals', label: '武功秘笈' },
  { href: '/dungeons', label: '副本資訊' },
  { href: '/masters', label: '師傅給物' },
  { href: '/attributes', label: '屬性獲得表' },
  { href: '/guides', label: '攻略圖解' },
  { href: '/tools/dazuo', label: '打坐計算' },
  { href: '/macros', label: '按精教程' },
  { href: '/updates', label: '近期更新' },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-rausch hover:text-rausch"
        >
          <span aria-hidden className="text-xl">⚔️</span>
          <span>人在江湖</span>
        </Link>
        <nav className="-mx-2 flex flex-1 items-center gap-1 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
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
      </div>
    </header>
  )
}
