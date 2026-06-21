'use client'

import { useState, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Built-in regression formulas (pre-calculated from sample data)
// ---------------------------------------------------------------------------
const FORMULAS = {
  轉生: { slope: 0.0781, intercept: 2.18 },
  未轉生: { slope: 0.1275, intercept: 7.02 },
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function DazuoPage() {
  const [estNL, setEstNL] = useState('')
  const [estTime, setEstTime] = useState('')

  // Estimate: 內力 → 時間
  const estimate = useMemo(() => {
    const nl = parseFloat(estNL)
    if (isNaN(nl) || nl <= 0) return null
    return {
      轉生: FORMULAS.轉生.intercept + FORMULAS.轉生.slope * nl,
      未轉生: FORMULAS.未轉生.intercept + FORMULAS.未轉生.slope * nl,
    }
  }, [estNL])

  // Reverse estimate: 時間 → 內力
  const reverseEstimate = useMemo(() => {
    const t = parseFloat(estTime)
    if (isNaN(t) || t <= 0) return null
    return {
      轉生: Math.max(0, (t - FORMULAS.轉生.intercept) / FORMULAS.轉生.slope),
      未轉生: Math.max(0, (t - FORMULAS.未轉生.intercept) / FORMULAS.未轉生.slope),
    }
  }, [estTime])

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    const mins = seconds / 60
    if (mins < 60) return `${mins.toFixed(1)} 分鐘`
    const hours = mins / 60
    return `${hours.toFixed(2)} 小時`
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-hairline bg-canvas p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">打坐時間計算器</h1>
        <p className="mt-2 text-sm text-muted">
          快速估算打坐所需時間，或根據可用時間計算能打坐的內力。
        </p>
      </div>

      {/* Main Calculator */}
      <div className="rounded-2xl border border-hairline bg-surface-soft p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* 內力 → 時間 */}
          <div className="rounded-xl border border-hairline bg-canvas p-5">
            <h2 className="text-lg font-semibold text-ink">內力 → 時間</h2>
            <p className="mt-1 text-xs text-muted">輸入要打坐的內力數量</p>
            <input
              type="number"
              placeholder="輸入內力"
              value={estNL}
              onChange={e => setEstNL(e.target.value)}
              className="mt-4 w-full rounded-xl border-2 border-blue-200 px-4 py-3 text-lg font-medium focus:border-blue-500 focus:outline-none"
            />
            {estimate && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3">
                  <span className="text-sm font-medium text-green-800">轉生</span>
                  <span className="text-xl font-bold text-green-700">{formatTime(estimate.轉生)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-orange-50 px-4 py-3">
                  <span className="text-sm font-medium text-orange-800">未轉生</span>
                  <span className="text-xl font-bold text-orange-700">{formatTime(estimate.未轉生)}</span>
                </div>
              </div>
            )}
          </div>

          {/* 時間 → 內力 */}
          <div className="rounded-xl border border-hairline bg-canvas p-5">
            <h2 className="text-lg font-semibold text-ink">時間 → 內力</h2>
            <p className="mt-1 text-xs text-muted">輸入可用的秒數</p>
            <input
              type="number"
              placeholder="輸入秒數"
              value={estTime}
              onChange={e => setEstTime(e.target.value)}
              className="mt-4 w-full rounded-xl border-2 border-indigo-200 px-4 py-3 text-lg font-medium focus:border-indigo-500 focus:outline-none"
            />
            {reverseEstimate && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3">
                  <span className="text-sm font-medium text-green-800">轉生</span>
                  <span className="text-xl font-bold text-green-700">{Math.round(reverseEstimate.轉生)} 內力</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-orange-50 px-4 py-3">
                  <span className="text-sm font-medium text-orange-800">未轉生</span>
                  <span className="text-xl font-bold text-orange-700">{Math.round(reverseEstimate.未轉生)} 內力</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Reference Table */}
      <div className="rounded-2xl border border-hairline bg-canvas p-6">
        <h2 className="text-lg font-semibold text-ink">快速參考表</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left">
                <th className="pb-3 pr-4 font-semibold text-ink">內力</th>
                <th className="pb-3 pr-4 text-right font-semibold text-green-700">轉生</th>
                <th className="pb-3 text-right font-semibold text-orange-700">未轉生</th>
              </tr>
            </thead>
            <tbody>
              {[50, 100, 200, 300, 500, 1000, 2000, 3000, 3900].map(nl => {
                const zsTime = FORMULAS.轉生.intercept + FORMULAS.轉生.slope * nl
                const wzsTime = FORMULAS.未轉生.intercept + FORMULAS.未轉生.slope * nl
                return (
                  <tr key={nl} className="border-b border-hairline-soft last:border-0 hover:bg-surface-soft">
                    <td className="py-2.5 pr-4 font-mono font-medium text-ink">{nl}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-green-700">{formatTime(zsTime)}</td>
                    <td className="py-2.5 text-right font-mono text-orange-700">{formatTime(wzsTime)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula Info */}
      <div className="rounded-2xl border border-hairline bg-surface-soft p-5">
        <h3 className="text-sm font-semibold text-ink">計算公式</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-canvas px-4 py-3">
            <div className="text-xs text-green-600">轉生角色</div>
            <div className="mt-1 font-mono text-sm text-ink">費時 ≈ 2.18 + 0.0781 × 內力</div>
          </div>
          <div className="rounded-lg bg-canvas px-4 py-3">
            <div className="text-xs text-orange-600">未轉生角色</div>
            <div className="mt-1 font-mono text-sm text-ink">費時 ≈ 7.02 + 0.1275 × 內力</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          轉生角色打坐速度約為未轉生角色的 1.6 倍。基本內功等級對打坐時間影響極小。
        </p>
      </div>
    </div>
  )
}
