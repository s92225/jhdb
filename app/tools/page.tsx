import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '工具總覽｜人在江湖資料庫',
  description: '打坐計算與按精教程。',
}

const TOOLS = [
  {
    href: '/tools/dazuo',
    icon: '🧘',
    title: '打坐時間計算器',
    desc: '輸入內力估算打坐所需時間，或由時間反推內力。',
  },
  {
    href: '/tools/macros',
    icon: '🤖',
    title: '按精教程',
    desc: '按鍵精靈 + 大漠 Plugin + OCR 自動打坐安裝教程。',
  },
]

export default function ToolsPage() {
  return (
    <div className="space-y-10">
      <header>
        <span className="pill">工具 · Tools</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">工具總覽</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-bodytext">
          輔助遊戲進行的計算器、規劃器與自動化教程。
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-2xl border border-hairline bg-canvas p-5 transition-shadow hover:shadow-airbnb"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{t.icon}</span>
              <div>
                <div className="font-semibold text-ink group-hover:text-rausch">{t.title}</div>
                <div className="mt-1 text-sm text-muted">{t.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
