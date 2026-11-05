'use client'

import { useId, useState } from 'react'
import { momentumBonus, signedPercent } from '@/lib/momentum'

export function MomentumExplorer({ compact = false }: { compact?: boolean }) {
  const [value, setValue] = useState(5)
  const rangeId = useId()
  const helpId = useId()
  const result = momentumBonus(value)
  return <div className={`momentum-explorer ${compact ? 'is-compact' : ''}`} data-ui>
    <label htmlFor={rangeId}>當前氣勢<output htmlFor={rangeId}>{value > 0 ? '+' : ''}{value}</output></label>
    <input id={rangeId} aria-describedby={helpId} type="range" min={-10} max={10} step={1} value={value} onChange={(e) => setValue(Number(e.target.value))} />
    <div className="range-labels"><span>−10 受制</span><span>0</span><span>+10 乘勢</span></div>
    <dl className="momentum-results" aria-live="polite" aria-atomic="true"><div><dt>命中率</dt><dd>{signedPercent(result.hit, true)}</dd></div><div><dt>純普攻傷害</dt><dd>{signedPercent(result.normal, true)}</dd></div><div><dt>特殊加成傷害</dt><dd>{signedPercent(result.special, true)}</dd></div></dl>
    <p id={helpId}>依官方速查以整數顯示，向零截斷；每回合出手後氣勢 ×0.85。</p>
    {!compact && <p>未截斷公式值：純普攻 {signedPercent(result.normal)}、特殊加成 {signedPercent(result.special)}。這是規則速查，並非遊戲伺服器戰鬥模擬。</p>}
  </div>
}
