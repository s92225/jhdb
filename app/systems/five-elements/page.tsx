import type { Metadata } from 'next'
import { FiveElementsInteractive } from '@/app/components/FiveElementsInteractive'

export const metadata: Metadata = {
  title: '五行相生相剋系統｜人在江湖資料庫',
  description: '互動式五行相生相剋圖：剋制 -20%、相生 +20% 的傷害修正。',
}

export default function FiveElementsPage() {
  return (
    <div className="space-y-6">
      <header>
        <span className="pill">攻略圖解 · Five Elements</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          五行相生相剋系統
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-bodytext">
          點擊節點切換我方／對方，查看
          <span className="font-semibold text-ink">剋制</span>
          或
          <span className="font-semibold text-ink">相生</span>
          產生的傷害修正（對方生我方 +20%、對方剋我方 -20%；反向不觸發）。
        </p>
      </header>
      <FiveElementsInteractive />
    </div>
  )
}
