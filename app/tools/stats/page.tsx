import type { Metadata } from 'next'
import { StatsCalculator } from './StatsCalculator'

export const metadata: Metadata = {
  title: '人物屬性計算器｜人在江湖資料庫',
  description: '依悟性、內力、根骨等屬性即時計算武功經驗、潛能消耗、氣精總和等數值。',
}

export default function StatsPage() {
  return <StatsCalculator />
}
