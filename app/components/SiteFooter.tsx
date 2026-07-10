import Link from 'next/link'

type FooterLink = { href: string; label: string; children?: FooterLink[] }

const FOOTER_LINKS: Array<{ heading: string; links: FooterLink[] }> = [
  {
    heading: '武學與裝備',
    links: [
      { href: '/skills', label: '武技總覽' },
      { href: '/skills/compare', label: '多選比較' },
      { href: '/skills/simulator', label: '特效模擬器' },
      { href: '/equipment', label: '武器神兵' },
      { href: '/equipment/manuals', label: '武功秘笈' },
    ],
  },
  {
    heading: '攻略與系統',
    links: [
      { href: '/guides/quests', label: '任務流程' },
      { href: '/guides/dungeons', label: '副本資訊' },
      { href: '/guides/masters', label: '師傅給物' },
      { href: '/guides/attributes', label: '屬性獲得表' },
      { href: '/systems/five-elements', label: '五行相生相剋' },
    ],
  },
  {
    heading: '工具與更新',
    links: [
      { href: '/tools/dazuo', label: '打坐計算' },
      { href: '/tools/macros', label: '按精教程' },
      { href: '/updates', label: '近期更新' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <span className="text-base font-semibold text-ink">人在江湖資料庫</span>
            <p className="text-sm text-muted">
              武技、任務、秘笈與副本資訊整理成可篩選、可比較的資料庫。
            </p>
          </div>
          {FOOTER_LINKS.map((group) => (
            <div key={group.heading} className="flex flex-col gap-2">
              <div className="text-sm font-semibold text-ink">{group.heading}</div>
              <ul className="flex flex-col gap-1.5 text-sm text-muted">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-ink">
                      {l.label}
                    </Link>
                    {l.children && l.children.length > 0 ? (
                      <ul className="mt-1.5 ml-4 flex flex-col gap-1.5 border-l border-hairline pl-3">
                        {l.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="hover:text-ink">
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-hairline-soft pt-6 text-[13px] text-muted">
          <span>© 2026 人在江湖資料庫</span>
          <span className="mx-2">·</span>
          <span>資料來源：寒江湖。本網站可能有誤，請以遊戲內為準。</span>
        </div>
      </div>
    </footer>
  )
}
