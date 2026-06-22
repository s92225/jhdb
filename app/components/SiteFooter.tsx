import Link from 'next/link'

const FOOTER_LINKS: Array<{ heading: string; links: Array<{ href: string; label: string }> }> = [
  {
    heading: '主要資訊',
    links: [
      { href: '/skills', label: '武技比較' },
      { href: '/dungeons', label: '副本資訊' },
      { href: '/quests', label: '任務流程' },
      { href: '/manuals', label: '武功秘笈' },
      { href: '/updates', label: '近期更新' },
    ],
  },
  {
    heading: '其他資訊',
    links: [
      { href: '/masters', label: '師傅給物' },
      { href: '/attributes', label: '屬性獲得表' },
      { href: '/guides', label: '攻略圖解' },
      { href: '/weapons', label: '武器神兵' },
      { href: '/five-elements', label: '五行相生相剋' },
      { href: '/effect-simulator', label: '特效效果模擬器' },
    ],
  },
  {
    heading: '工具與教學',
    links: [
      { href: '/tools/dazuo', label: '打坐計算' },
      { href: '/macros', label: '按精教程' },
      { href: '/macros/dazuo-ocr', label: 'DaZuo OCR' },
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
