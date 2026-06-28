import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '攻略圖解｜人在江湖資料庫',
  description: '攻略入口：五行系統、特效模擬器、神兵與大漠迷宮等攻略。',
}

const HUBS = [
  {
    href: '/five-elements',
    title: '五行相生相剋系統',
    desc: '互動式五行圖：剋制 −20%、相生 +20%。',
  },
  {
    href: '/effect-simulator',
    title: '特效效果模擬器',
    desc: '連擊、兵器加成、暗勁/毒性/寒毒疊層、組合技能。',
  },
  {
    href: '/quests#dungeon-damo-maze',
    title: '大漠 · 轉生之地迷宮',
    desc: '迷宮路線解法（已整合至任務流程）。',
  },
  {
    href: '/weapons',
    title: '武器神兵取得流程',
    desc: '神兵任務線、鑄煉素材、可鑄煉武器一覽。',
  },
  {
    href: '/manuals#anran',
    title: '黯然銷魂掌取得',
    desc: '峨嵋／大漠對話任務線（已移至武功秘笈頁）。',
  },
]

export default function GuidesPage() {
  return (
    <div className="space-y-12">
      <header>
        <span className="pill">攻略圖解 · Guides</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          攻略圖解
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-bodytext">
          各類攻略圖解入口。互動式五行系統與特效模擬器已拆為獨立頁；大漠迷宮已整合到任務流程。
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {HUBS.map((h) => (
          <Link
            key={h.href}
            href={h.href}
            className="group rounded-2xl border border-hairline bg-canvas p-5 transition-shadow hover:shadow-airbnb"
          >
            <div className="text-lg font-semibold text-ink group-hover:text-rausch">{h.title}</div>
            <div className="mt-1 text-sm text-bodytext">{h.desc}</div>
            <div className="mt-3 text-sm font-medium text-rausch">前往 →</div>
          </Link>
        ))}
      </section>

    </div>
  )
}
