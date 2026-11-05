import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { ReferenceHeading } from '@/app/components/ReferenceHeading'

export const metadata: Metadata = {
  title: '工具總覽｜人在江湖資料庫',
  description: '打坐計算與按精教程。',
}

const TOOLS = [
  {
    href: '/tools/dazuo',
    title: '打坐時間計算器',
    desc: '輸入內力估算打坐所需時間，或由時間反推內力。',
  },
  {
    href: '/tools/stats',
    title: '人物屬性計算器',
    desc: '調整悟性、內力、根骨等屬性，即時計算武功經驗、潛能、氣精總和。',
  },
  {
    href: '/tools/macros',
    title: '按精教程',
    desc: '按鍵精靈 + 大漠 Plugin + OCR 自動打坐安裝教程。',
  },
]

export default function ToolsPage() {
  return (
    <div className="space-y-10">
      <ReferenceHeading title="工具總覽" description={<p>輔助遊戲進行的計算器、規劃器與自動化教程。</p>} />

      <div className="reference-directory">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="reference-directory-row group"
          >
            <div className="flex items-start gap-4">
              <div>
                <h2>{t.title}</h2>
                <p className="mt-3 text-base text-bodytext">{t.desc}</p>
              </div>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  )
}
