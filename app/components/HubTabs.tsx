'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type HubTab = { href: string; label: string; exact?: boolean }

const HUBS: Record<string, { title: string; tabs: HubTab[] }> = {
  skills: {
    title: '武學',
    tabs: [
      { href: '/skills', label: '武技總覽', exact: true },
      { href: '/skills/compare', label: '多選比較' },
      { href: '/skills/simulator', label: '特效模擬器' },
    ],
  },
  guides: {
    title: '攻略',
    tabs: [
      { href: '/guides/quests', label: '任務流程' },
      { href: '/guides/dungeons', label: '副本資訊' },
      { href: '/guides/masters', label: '師傅給物' },
      { href: '/guides/attributes', label: '屬性獲得表' },
    ],
  },
  equipment: {
    title: '裝備',
    tabs: [
      { href: '/equipment', label: '武器神兵', exact: true },
      { href: '/equipment/manuals', label: '武功秘笈' },
    ],
  },
  systems: {
    title: '系統',
    tabs: [
      { href: '/systems', label: '系統總覽', exact: true },
      { href: '/systems/five-elements', label: '五行相生相剋' },
    ],
  },
  tools: {
    title: '工具',
    tabs: [
      { href: '/tools', label: '工具總覽', exact: true },
      { href: '/tools/dazuo', label: '打坐計算' },
      { href: '/tools/macros', label: '按精教程' },
    ],
  },
}

export function HubTabs({ hub }: { hub: keyof typeof HUBS }) {
  const pathname = usePathname() || '/'
  const def = HUBS[hub]
  if (!def) return null

  // Hide on pages that are not part of the tab set (e.g. /skills/[id] detail)
  const isKnown = def.tabs.some((t) =>
    t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(`${t.href}/`),
  )
  if (!isKnown) return null

  return (
    <nav
      aria-label={`${def.title}分頁`}
      className="-mx-1 mb-6 flex items-center gap-1 overflow-x-auto border-b border-hairline-soft px-1 pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {def.tabs.map((t) => {
        const active = t.exact
          ? pathname === t.href
          : pathname === t.href || pathname.startsWith(`${t.href}/`)
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className={[
              'whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'border-rausch text-ink'
                : 'border-transparent text-muted hover:border-hairline hover:text-ink',
            ].join(' ')}
          >
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
