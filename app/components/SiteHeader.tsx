import Link from 'next/link'

const nav = [
  { href: '/skills', label: '武技比較' },
  { href: '/quests', label: '任務流程' },
  { href: '/manuals', label: '武功秘笈' },
  { href: '/dungeons', label: '副本資訊' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-zinc-900">
          人在江湖資料庫
        </Link>
        <nav className="flex gap-4 text-sm">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-zinc-700 hover:text-zinc-900">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
