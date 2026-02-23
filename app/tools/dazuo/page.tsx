'use client'

import { useState, useMemo, useRef, useEffect } from 'react'

// ---------------------------------------------------------------------------
// Built-in character data
// ---------------------------------------------------------------------------
type CharacterData = {
  name: string
  門派: string
  基本內功: number
  轉生: boolean
  isUser?: boolean
  data: [number, number][] // [內力, 費時s]
}

const BUILTIN_CHARACTERS: CharacterData[] = [
  {
    name: '角色A',
    門派: '鎮遠武館',
    基本內功: 459,
    轉生: true,
    data: [
      [20, 3.96], [30, 4.26], [40, 5.90], [50, 6.29],
      [60, 7.34], [70, 7.08], [110, 10.33], [200, 18.33], [300, 25.34],
    ],
  },
  {
    name: '角色B',
    門派: '少林',
    基本內功: 500,
    轉生: true,
    data: [
      [20, 3.74], [30, 3.82], [40, 5.69], [50, 5.91],
      [60, 7.01], [70, 7.01], [80, 9.31], [90, 9.50],
      [100, 10.19], [110, 10.05], [200, 18.35], [300, 25.32],
    ],
  },
  {
    name: '角色C',
    門派: '少林',
    基本內功: 474,
    轉生: false,
    data: [
      [20, 10.42], [50, 13.61], [70, 14.96],
      [100, 19.61], [200, 32.54], [300, 45.55],
    ],
  },
]

// ---------------------------------------------------------------------------
// Linear regression
// ---------------------------------------------------------------------------
function linearRegression(points: [number, number][]): { slope: number; intercept: number; r2: number } {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 }

  let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0
  for (const [x, y] of points) {
    sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y
  }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  const intercept = (sy - slope * sx) / n
  const ssTot = syy - (sy * sy) / n
  const ssRes = points.reduce((s, [x, y]) => s + (y - intercept - slope * x) ** 2, 0)
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0

  return { slope, intercept, r2 }
}

// ---------------------------------------------------------------------------
// Colors for chart lines
// ---------------------------------------------------------------------------
const COLORS = [
  '#e74c3c', '#3498db', '#f39c12', '#2ecc71', '#9b59b6',
  '#1abc9c', '#e67e22', '#34495e',
]

// ---------------------------------------------------------------------------
// Chart component (canvas-based, no dependencies)
// ---------------------------------------------------------------------------
function DazuoChart({ characters }: { characters: CharacterData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    // Margins
    const ml = 60, mr = 20, mt = 20, mb = 40
    const pw = w - ml - mr
    const ph = h - mt - mb

    // Find data range
    let maxX = 0, maxY = 0
    for (const c of characters) {
      for (const [x, y] of c.data) {
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
    maxX = Math.ceil(maxX / 50) * 50 + 50
    maxY = Math.ceil(maxY / 5) * 5 + 5

    const sx = (x: number) => ml + (x / maxX) * pw
    const sy = (y: number) => mt + ph - (y / maxY) * ph

    // Clear
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, w, h)

    // Grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const yv = (maxY / 5) * i
      const yy = sy(yv)
      ctx.beginPath(); ctx.moveTo(ml, yy); ctx.lineTo(w - mr, yy); ctx.stroke()
      ctx.fillStyle = '#6b7280'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right'
      ctx.fillText(`${Math.round(yv)}s`, ml - 6, yy + 4)
    }
    for (let xv = 0; xv <= maxX; xv += 50) {
      const xx = sx(xv)
      ctx.beginPath(); ctx.moveTo(xx, mt); ctx.lineTo(xx, mt + ph); ctx.stroke()
      ctx.fillStyle = '#6b7280'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(`${xv}`, xx, mt + ph + 16)
    }

    // Axis labels
    ctx.fillStyle = '#374151'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('打坐 內力', ml + pw / 2, h - 4)
    ctx.save()
    ctx.translate(14, mt + ph / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('費時 (s)', 0, 0)
    ctx.restore()

    // Plot each character
    characters.forEach((c, ci) => {
      const color = COLORS[ci % COLORS.length]
      const reg = linearRegression(c.data)

      // Regression line
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 3])
      ctx.beginPath()
      ctx.moveTo(sx(0), sy(reg.intercept))
      ctx.lineTo(sx(maxX), sy(reg.intercept + reg.slope * maxX))
      ctx.stroke()
      ctx.setLineDash([])

      // Data points (skip for user-added characters)
      if (!c.isUser) {
        for (const [x, y] of c.data) {
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(sx(x), sy(y), 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
      }
    })

    // Legend
    const legendX = ml + 10
    let legendY = mt + 14
    characters.forEach((c, ci) => {
      const color = COLORS[ci % COLORS.length]
      ctx.fillStyle = color
      ctx.fillRect(legendX, legendY - 8, 12, 12)
      ctx.fillStyle = '#374151'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'left'
      const label = `${c.name} (${c.轉生 ? '轉生' : '未轉生'}, 內功${c.基本內功})`
      ctx.fillText(label, legendX + 16, legendY + 2)
      legendY += 18
    })
  }, [characters])

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg border bg-white"
      style={{ height: 400 }}
    />
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function DazuoPage() {
  const [userPoints, setUserPoints] = useState<[number, number][]>([])
  const [inputNL, setInputNL] = useState('')
  const [inputTime, setInputTime] = useState('')
  const [userName, setUserName] = useState('我的角色')
  const [userNeigong, setUserNeigong] = useState('')
  const [userZhuansheng, setUserZhuansheng] = useState(true)

  // Estimator
  const [estNL, setEstNL] = useState('')
  const [estTime, setEstTime] = useState('')

  // All characters (built-in + user)
  const allCharacters = useMemo(() => {
    const list = [...BUILTIN_CHARACTERS]
    if (userPoints.length >= 2) {
      list.push({
        name: userName || '我的角色',
        門派: '—',
        基本內功: parseInt(userNeigong) || 0,
        轉生: userZhuansheng,
        isUser: true,
        data: userPoints,
      })
    }
    return list
  }, [userPoints, userName, userNeigong, userZhuansheng])

  // Per-character regressions
  const regressions = useMemo(() => {
    return allCharacters.map(c => ({
      ...c,
      reg: linearRegression(c.data),
    }))
  }, [allCharacters])

  // Group by 轉生 status for summary formulas
  const groupedFormulas = useMemo(() => {
    const zs = allCharacters.filter(c => c.轉生)
    const wzs = allCharacters.filter(c => !c.轉生)
    const zsAll: [number, number][] = zs.flatMap(c => c.data)
    const wzsAll: [number, number][] = wzs.flatMap(c => c.data)
    return {
      轉生: zsAll.length >= 2 ? linearRegression(zsAll) : null,
      未轉生: wzsAll.length >= 2 ? linearRegression(wzsAll) : null,
    }
  }, [allCharacters])

  // Estimate
  const estimate = useMemo(() => {
    const nl = parseFloat(estNL)
    if (isNaN(nl) || nl <= 0) return null
    const results: { label: string; time: number }[] = []
    if (groupedFormulas.轉生) {
      const t = groupedFormulas.轉生.intercept + groupedFormulas.轉生.slope * nl
      results.push({ label: '轉生', time: t })
    }
    if (groupedFormulas.未轉生) {
      const t = groupedFormulas.未轉生.intercept + groupedFormulas.未轉生.slope * nl
      results.push({ label: '未轉生', time: t })
    }
    return results
  }, [estNL, groupedFormulas])

  // Reverse estimate
  const reverseEstimate = useMemo(() => {
    const t = parseFloat(estTime)
    if (isNaN(t) || t <= 0) return null
    const results: { label: string; neili: number }[] = []
    if (groupedFormulas.轉生 && groupedFormulas.轉生.slope > 0) {
      const nl = (t - groupedFormulas.轉生.intercept) / groupedFormulas.轉生.slope
      results.push({ label: '轉生', neili: Math.max(0, nl) })
    }
    if (groupedFormulas.未轉生 && groupedFormulas.未轉生.slope > 0) {
      const nl = (t - groupedFormulas.未轉生.intercept) / groupedFormulas.未轉生.slope
      results.push({ label: '未轉生', neili: Math.max(0, nl) })
    }
    return results
  }, [estTime, groupedFormulas])

  function addUserPoint() {
    const nl = parseFloat(inputNL)
    const t = parseFloat(inputTime)
    if (isNaN(nl) || isNaN(t) || nl <= 0 || t <= 0) return
    setUserPoints(prev => [...prev, [nl, t] as [number, number]].sort((a, b) => a[0] - b[0]))
    setInputNL('')
    setInputTime('')
  }

  function removeUserPoint(idx: number) {
    setUserPoints(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">打坐時間計算器</h1>
        <p className="mt-2 text-sm text-zinc-600">
          分析打坐(內力)與費時的關係，比較不同角色，並估算你的打坐時間。
        </p>
      </div>

      {/* User data input */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">輸入你的資料</h2>
        <p className="mt-1 text-sm text-zinc-500">輸入至少 2 筆打坐數據，即可加入圖表比較。</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-zinc-500">角色名稱</label>
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">基本內功</label>
            <input
              type="number"
              value={userNeigong}
              onChange={e => setUserNeigong(e.target.value)}
              placeholder="例: 459"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">轉生狀態</label>
            <select
              value={userZhuansheng ? 'yes' : 'no'}
              onChange={e => setUserZhuansheng(e.target.value === 'yes')}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="yes">已轉生</option>
              <option value="no">未轉生</option>
            </select>
          </div>
        </div>

        {/* Add data point */}
        <div className="mt-4">
          <label className="text-xs font-medium text-zinc-500">新增數據點</label>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              placeholder="內力"
              value={inputNL}
              onChange={e => setInputNL(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addUserPoint()}
              className="w-32 rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="費時(s)"
              value={inputTime}
              onChange={e => setInputTime(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addUserPoint()}
              className="w-32 rounded-lg border px-3 py-2 text-sm"
            />
            <button
              onClick={addUserPoint}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
            >
              新增
            </button>
          </div>
        </div>

        {/* User data points */}
        {userPoints.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-medium text-zinc-500">你的數據 ({userPoints.length} 筆)</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {userPoints.map(([nl, t], i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full border bg-zinc-50 px-3 py-1 text-sm"
                >
                  <span className="font-mono">{nl}</span>
                  <span className="text-zinc-400">→</span>
                  <span className="font-mono">{t}s</span>
                  <button
                    onClick={() => removeUserPoint(i)}
                    className="ml-1 text-zinc-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {userPoints.length >= 2 && (
              <div className="mt-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm">
                你的公式：費時 ≈ {linearRegression(userPoints).intercept.toFixed(2)} + {linearRegression(userPoints).slope.toFixed(4)} × 內力
                <span className="ml-2 text-zinc-500">R² = {linearRegression(userPoints).r2.toFixed(4)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">圖表</h2>
        <div className="mt-4">
          <DazuoChart characters={allCharacters} />
        </div>
      </div>

      {/* Analysis Results */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">分析結果</h2>

        {/* Grouped formulas */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {groupedFormulas.轉生 && (
            <div className="rounded-xl border bg-green-50 p-4">
              <div className="text-sm font-semibold text-green-800">轉生角色公式</div>
              <div className="mt-2 font-mono text-sm text-green-900">
                費時 ≈ {groupedFormulas.轉生.intercept.toFixed(2)} + {groupedFormulas.轉生.slope.toFixed(4)} × 內力
              </div>
              <div className="mt-1 text-xs text-green-700">R² = {groupedFormulas.轉生.r2.toFixed(4)}</div>
            </div>
          )}
          {groupedFormulas.未轉生 && (
            <div className="rounded-xl border bg-orange-50 p-4">
              <div className="text-sm font-semibold text-orange-800">未轉生角色公式</div>
              <div className="mt-2 font-mono text-sm text-orange-900">
                費時 ≈ {groupedFormulas.未轉生.intercept.toFixed(2)} + {groupedFormulas.未轉生.slope.toFixed(4)} × 內力
              </div>
              <div className="mt-1 text-xs text-orange-700">R² = {groupedFormulas.未轉生.r2.toFixed(4)}</div>
            </div>
          )}
        </div>

        {/* Per-character table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-zinc-500">
                <th className="pb-2 pr-4 font-medium">角色</th>
                <th className="pb-2 pr-4 font-medium">門派</th>
                <th className="pb-2 pr-4 font-medium text-right">基本內功</th>
                <th className="pb-2 pr-4 font-medium">轉生</th>
                <th className="pb-2 pr-4 font-medium text-right">斜率</th>
                <th className="pb-2 pr-4 font-medium text-right">截距</th>
                <th className="pb-2 font-medium text-right">R²</th>
              </tr>
            </thead>
            <tbody>
              {regressions.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">
                    <span className="inline-block mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {r.name}
                  </td>
                  <td className="py-2 pr-4 text-zinc-600">{r.門派}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.基本內功 || '—'}</td>
                  <td className="py-2 pr-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${r.轉生 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {r.轉生 ? '是' : '否'}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums font-mono">{r.reg.slope.toFixed(4)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums font-mono">{r.reg.intercept.toFixed(2)}</td>
                  <td className="py-2 text-right tabular-nums font-mono">{r.reg.r2.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key finding */}
        <div className="mt-4 rounded-xl border bg-blue-50 p-4">
          <div className="text-sm font-semibold text-blue-800">發現</div>
          <ul className="mt-2 space-y-1 text-sm text-blue-900">
            <li>• 轉生角色的打坐速度明顯快於未轉生角色（斜率 ~0.078 vs ~0.128）</li>
            <li>• 轉生角色的基礎時間也較低（截距 ~2.2s vs ~7.0s）</li>
            <li>• 基本內功等級對打坐時間影響極小（&lt;0.1s 差異）</li>
            <li>• 主要影響因素：<strong>轉生狀態</strong> &gt; 內力數量 &gt;&gt; 基本內功等級</li>
          </ul>
        </div>
      </div>

      {/* Estimator */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">估算工具</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {/* Forward: 內力 → time */}
          <div>
            <label className="text-sm font-medium text-zinc-700">輸入內力 → 估算費時</label>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                placeholder="內力數量"
                value={estNL}
                onChange={e => setEstNL(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            {estimate && estimate.length > 0 && (
              <div className="mt-2 space-y-1">
                {estimate.map(e => (
                  <div key={e.label} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm">
                    <span className={`font-medium ${e.label === '轉生' ? 'text-green-700' : 'text-orange-700'}`}>{e.label}</span>
                    ：約 <span className="font-mono font-semibold">{e.time.toFixed(1)}s</span>
                    {e.time >= 60 && <span className="text-zinc-500">（{(e.time / 60).toFixed(1)} 分鐘）</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reverse: time → 內力 */}
          <div>
            <label className="text-sm font-medium text-zinc-700">輸入秒數 → 估算可打坐內力</label>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                placeholder="目標秒數"
                value={estTime}
                onChange={e => setEstTime(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            {reverseEstimate && reverseEstimate.length > 0 && (
              <div className="mt-2 space-y-1">
                {reverseEstimate.map(e => (
                  <div key={e.label} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm">
                    <span className={`font-medium ${e.label === '轉生' ? 'text-green-700' : 'text-orange-700'}`}>{e.label}</span>
                    ：約 <span className="font-mono font-semibold">{Math.round(e.neili)}</span> 內力
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick reference */}
        <div className="mt-6">
          <div className="text-sm font-medium text-zinc-700">快速參考表</div>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="pb-2 pr-4 font-medium">內力</th>
                  {groupedFormulas.轉生 && <th className="pb-2 pr-4 font-medium text-right text-green-700">轉生費時</th>}
                  {groupedFormulas.未轉生 && <th className="pb-2 font-medium text-right text-orange-700">未轉生費時</th>}
                </tr>
              </thead>
              <tbody>
                {[20, 50, 100, 200, 300, 500, 1000, 2000, 3900].map(nl => (
                  <tr key={nl} className="border-b last:border-0">
                    <td className="py-1.5 pr-4 tabular-nums font-mono">{nl}</td>
                    {groupedFormulas.轉生 && (
                      <td className="py-1.5 pr-4 text-right tabular-nums font-mono">
                        {(groupedFormulas.轉生.intercept + groupedFormulas.轉生.slope * nl).toFixed(1)}s
                        {(groupedFormulas.轉生.intercept + groupedFormulas.轉生.slope * nl) >= 60 &&
                          <span className="ml-1 text-zinc-400">
                            ({((groupedFormulas.轉生.intercept + groupedFormulas.轉生.slope * nl) / 60).toFixed(1)}m)
                          </span>
                        }
                      </td>
                    )}
                    {groupedFormulas.未轉生 && (
                      <td className="py-1.5 text-right tabular-nums font-mono">
                        {(groupedFormulas.未轉生.intercept + groupedFormulas.未轉生.slope * nl).toFixed(1)}s
                        {(groupedFormulas.未轉生.intercept + groupedFormulas.未轉生.slope * nl) >= 60 &&
                          <span className="ml-1 text-zinc-400">
                            ({((groupedFormulas.未轉生.intercept + groupedFormulas.未轉生.slope * nl) / 60).toFixed(1)}m)
                          </span>
                        }
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Raw data */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">原始數據</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allCharacters.map((c, ci) => (
            <div key={ci} className="rounded-xl border p-4">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[ci % COLORS.length] }} />
                <span className="font-medium">{c.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.轉生 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                  {c.轉生 ? '轉生' : '未轉生'}
                </span>
              </div>
              <div className="mt-1 text-xs text-zinc-500">{c.門派} · 基本內功 {c.基本內功 || '—'}</div>
              <table className="mt-2 w-full text-xs">
                <thead>
                  <tr className="border-b text-zinc-500">
                    <th className="pb-1 text-left font-medium">內力</th>
                    <th className="pb-1 text-right font-medium">費時(s)</th>
                  </tr>
                </thead>
                <tbody>
                  {c.data.map(([nl, t], i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1 tabular-nums font-mono">{nl}</td>
                      <td className="py-1 text-right tabular-nums font-mono">{t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
