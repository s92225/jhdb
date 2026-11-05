import { DAMO_CELLS, DAMO_LAYOUT, DAMO_ROUTE, damoCellTone, type MazeCellSpec, type MazeTone } from '@/lib/damo-maze'

function DirLabel({ pos, value }: { pos: 'top' | 'right' | 'bottom' | 'left'; value?: string }) {
  if (!value) return null
  const isExit = value === '出口'
  return <span className={`maze-direction maze-direction--${pos}${isExit ? ' maze-direction--exit' : ''}`}>{value}</span>
}

function MazeCell({ cell }: { cell: MazeCellSpec }) {
  const tone = damoCellTone(cell.id)
  const label = tone === 'start' ? '入口' : tone === 'target' ? '強者' : tone === 'route' ? '途經' : undefined
  return (
    <div className="maze-cell" data-maze-cell={cell.id} data-maze-tone={tone} role="group" aria-label={`第 ${cell.id} 格${label ? `，${label}` : ''}`}>
      <span className="maze-cell-id">{cell.id}</span>
      {label ? <span className="maze-cell-label">{label}</span> : null}
      <DirLabel pos="top" value={cell.T} />
      <DirLabel pos="right" value={cell.R} />
      <DirLabel pos="bottom" value={cell.B} />
      <DirLabel pos="left" value={cell.L} />
    </div>
  )
}

function Legend({ tone, label }: { tone: MazeTone; label: string }) {
  return (
    <li className="maze-legend-item">
      <span className="maze-legend-swatch" data-maze-tone={tone} aria-hidden="true" />
      <span>{label}</span>
    </li>
  )
}

function KStat({ label, value }: { label: string; value: string }) {
  return <div className="maze-stat"><dt>{label}</dt><dd>{value}</dd></div>
}

export function DamoMaze() {
  return (
    <section id="dungeon-damo-maze" className="damo-maze scroll-mt-24 space-y-6" aria-labelledby="damo-maze-title">
      <div>
        <h2 id="damo-maze-title" className="text-xl font-bold text-ink">大漠 · 轉生之地迷宮解法</h2>
        <p className="mt-2 max-w-3xl text-sm text-bodytext">
          在成都往北的<span className="font-semibold text-ink">大漠</span>中有條路通往
          <span className="font-semibold text-ink">荒漠</span>，荒漠迷宮內由「強者」負責
          <span className="font-semibold text-ink">轉生</span>。
          每格的四個數字代表<span className="font-semibold text-ink">朝該方向會傳送到哪一格</span>，並非空間排列。
        </p>
      </div>

      <div className="maze-layout">
        <div className="maze-panel maze-map-panel">
          <h3>迷宮地圖（依原圖）</h3>
          <div className="maze-grid" role="group" aria-label="迷宮十格與各方向傳送目的地">
            {Array.from({ length: 12 }).map((_, idx) => {
              const row = Math.floor(idx / 4)
              const col = idx % 4
              const slotKey = `maze-slot-${row}-${col}`
              const cell = DAMO_CELLS.find((c) => {
                const [r, k] = DAMO_LAYOUT[c.id]
                return r === row && k === col
              })
              if (!cell) {
                if (row === 1 && col === 3) return <div key={slotKey} className="maze-grid-note">進入第一格為 1</div>
                return <div key={slotKey} />
              }
              return <MazeCell key={slotKey} cell={cell} />
            })}
          </div>
          <ul className="maze-legend" aria-label="地圖圖例">
            <Legend tone="start" label="入口：第 1 格" />
            <Legend tone="route" label="途經：2 → 3 → 4" />
            <Legend tone="target" label="強者：第 5 格" />
            <Legend tone="exit" label="出口：第 1 格向右" />
          </ul>
        </div>

        <div className="maze-details">
          <div className="maze-panel maze-route-panel">
            <h3>快速到達法</h3>
            <p className="mt-2 text-sm text-bodytext">進入第一格 (1) 後，依序：</p>
            <ol className="maze-route-list">
              {DAMO_ROUTE.map((s, i) => (
                <li key={s.from}>
                  <span className="maze-step-index">{i + 1}</span>
                  <span className="maze-step-dir">{s.dir}</span>
                  <span className="maze-step-copy">從 <b>{s.from}</b> → <b>{s.to}</b>
                    {s.to === 5 ? <span className="maze-destination">強者 · 完成轉生對話</span> : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="maze-panel maze-requirement-panel">
            <h3>轉生條件</h3>
            <p className="mt-2 text-sm text-bodytext">年齡：<strong>滿 101 歲</strong></p>
          </div>

          <div className="maze-panel maze-stats-panel">
            <h3>轉生前建議數值</h3>
            <dl className="maze-stats">
              <KStat label="基拳 / 基輕" value="500 級" />
              <KStat label="基內" value="550 級" />
              <KStat label="讀書" value="700 級" />
              <KStat label="內力" value="5,500" />
              <KStat label="精力" value="1,650" />
            </dl>
            <p className="mt-3 text-xs text-muted">建議於轉生前先把以上數值衝至門檻，避免轉生後重練吃力。</p>
          </div>
        </div>
      </div>
    </section>
  )
}
