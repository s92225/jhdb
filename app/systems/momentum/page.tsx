import type { Metadata } from 'next'
import Link from 'next/link'
import { MOMENTUM_RULES, momentumBonus, signedPercent } from '@/lib/momentum'
import { MomentumExplorer } from '@/app/components/MomentumExplorer'

export const metadata: Metadata = { title: '氣勢系統與加成速查｜JHDB', description: '2026 年 10 月 31 日官方氣勢系統：得失、命中加成、純普攻及特殊加成傷害、衰減與歸零規則。' }

export default function MomentumPage() {
  return <div className="rule-page">
    <header><h1>氣勢系統</h1><p className="mt-4">2026 年 10 月 31 日實裝。氣勢介乎 −10 至 +10，招式結果會改變雙方氣勢，並影響命中率與傷害。以下整理自<a className="underline underline-offset-4" href="https://eokatok.mystrikingly.com/" target="_blank" rel="noreferrer">寒江湖官方公告</a>。</p></header>
    <section className="rule-intro" aria-labelledby="bonus-title"><div><h2 id="bonus-title" className="text-3xl mb-5">先看這一招的加成</h2><p>每點氣勢影響命中率 1%，上限 ±10%。純普攻每點影響傷害 0.5%；若本招觸發特殊加成，改按每點 0.25% 計算。兩種傷害加成都設 ±5% 硬上限。</p><p className="mt-4">特殊加成包括神兵共鳴、上古暴擊、五行、連擊、傳承奧義、左右互搏與控場等。右側速查不猜測伺服器未公開的計算順序。</p></div><MomentumExplorer /></section>
    <section aria-labelledby="event-title"><h2 id="event-title">一招之間，氣勢得失</h2><table><caption className="sr-only">招式結果對攻守雙方的氣勢變化</caption><thead><tr><th scope="col">招式結果</th><th scope="col">攻擊方</th><th scope="col">防守方</th></tr></thead><tbody>{MOMENTUM_RULES.events.map((event) => <tr key={event.name}><th scope="row">{event.name}</th><td>{event.attacker > 0 ? '+' : ''}{event.attacker}</td><td>{event.defender > 0 ? '+' : ''}{event.defender}</td></tr>)}<tr><th scope="row">神兵共鳴／上古暴擊／五行觸發</th><td>±1</td><td>相反變化</td></tr></tbody></table><p className="mt-4">官方未逐項說明最後一列的正負判定，不額外推定。每回合出手後，現有氣勢乘以 {MOMENTUM_RULES.decay} 自然衰減。</p></section>
    <section aria-labelledby="lookup-title"><h2 id="lookup-title">官方數值速查</h2><table><caption className="sr-only">與官方速查相同的整數顯示；負零統一顯示零</caption><thead><tr><th scope="col">氣勢</th><th scope="col">命中率</th><th scope="col">純普攻</th><th scope="col">特殊加成</th></tr></thead><tbody>{[10,7,5,3,0,-3,-5,-10].map((n) => { const bonus = momentumBonus(n); return <tr key={n}><th scope="row">{n > 0 ? '+' : ''}{n}</th><td>{signedPercent(bonus.hit,true)}</td><td>{signedPercent(bonus.normal,true)}</td><td>{signedPercent(bonus.special,true)}</td></tr> })}</tbody></table></section>
    <section className="rule-callout" aria-labelledby="reset-title"><h2 id="reset-title">何時重新歸零？</h2><p>{MOMENTUM_RULES.reset.join('、')}，氣勢一律清零。以上只作官方規則參考，並非對遊戲內實際傷害的保證。</p><Link href="/skills/simulator" className="text-action">查看原有特效模擬器 →</Link></section>
  </div>
}
