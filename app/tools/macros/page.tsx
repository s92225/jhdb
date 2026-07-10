import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '按精教程｜人在江湖資料庫',
  description: '新手按鍵精靈 + 大漠 Plugin + OCR 自動化腳本安裝與使用教程。',
}

const TUTORIALS = [
  {
    href: '/tools/macros/dazuo-ocr',
    icon: '🧘',
    title: 'DaZuo OCR 自動打坐',
    desc: '按鍵精靈 + 大漠 Plugin + 打坐 OCR Script 完整安裝教程。OCR 自動讀取內力與氣，全程自動打坐衝內力。',
    tags: ['按鍵精靈', '大漠 Plugin', 'OCR', '打坐'],
  },
]

export default function MacrosPage() {
  return (
    <div className="space-y-12">
      <header>
        <span className="pill">按精教程 · Macro Tutorials</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          按精教程
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-bodytext">
          手把手教新手安裝按鍵精靈、大漠 Plugin 與 OCR 腳本，照著步驟做就可以自動打坐、自動補藥酒。
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold text-ink">教程列表</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {TUTORIALS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group rounded-2xl border border-hairline bg-canvas p-6 transition-shadow hover:shadow-airbnb"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{t.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-semibold text-ink group-hover:text-rausch">
                    {t.title}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-bodytext">
                    {t.desc}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-hairline-soft bg-surface-soft px-2.5 py-0.5 text-xs text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
