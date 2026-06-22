import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '攻略圖解｜人在江湖資料庫',
  description: '攻略入口：五行系統、特效模擬器、黯然銷魂掌等取得攻略。',
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
]

const ANRAN_STEPS = [
  { loc: '峨嵋', npc: '郭襄', text: '詢問《楊過》，會回饋「我也找許久了」' },
  { loc: '成都', npc: '—', text: '傳送至成都後往大漠方向前進' },
  { loc: '大漠 · 轉生之地', npc: '十大強者', text: '進入轉生之地找到《十大強者》' },
  { loc: '大漠 · 轉生之地', npc: '十大強者', text: '詢問《楊過》後退出' },
  { loc: '峨嵋', npc: '郭襄', text: '回報《楊過下落》' },
  { loc: '峨嵋', npc: '郭襄', text: '取得《黯然銷魂掌》秘笈' },
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

      <section id="anran" className="space-y-6 scroll-mt-24">
        <div>
          <h2 className="text-2xl font-bold text-ink">黯然銷魂掌取得</h2>
          <p className="mt-2 max-w-3xl text-sm text-bodytext">
            需要完成峨嵋與大漠之間的多段對話任務，最終由郭襄交付秘笈。
          </p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {ANRAN_STEPS.map((s, i) => (
            <li key={i} className="flex gap-4 rounded-2xl border border-hairline bg-canvas p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rausch text-sm font-bold text-white">
                {i + 1}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-surface-strong px-2 py-0.5 font-medium text-ink">
                    {s.loc}
                  </span>
                  <span className="text-muted">NPC：{s.npc}</span>
                </div>
                <div className="mt-2 text-sm text-bodytext">{s.text}</div>
              </div>
            </li>
          ))}
        </ol>
        <div className="text-sm text-muted">
          亦可在
          <Link href="/manuals#manual-anran-xiaohun-zhang" className="mx-1 font-medium text-rausch hover:text-rausch-active">
            武功秘笈
          </Link>
          頁查看本秘笈條目。
        </div>
      </section>
    </div>
  )
}
