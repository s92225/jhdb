type CellSpec = {
  id: number
  T?: string
  R?: string
  B?: string
  L?: string
  label?: string
  exitDir?: 'T' | 'R' | 'B' | 'L'
}

const CELLS: CellSpec[] = [
  { id: 1, T: '2', R: '出口', B: '7', L: '8', exitDir: 'R' },
  { id: 4, T: '3', R: '5', B: '7', L: '7' },
  { id: 7, T: '4', R: '1', B: '3', L: '6' },
  { id: 10, T: '9', R: '3', B: '—', L: '9' },
  { id: 2, T: '10', R: '3', B: '1', L: '9' },
  { id: 5, T: '1', R: '6', B: '7', L: '4', label: '強者' },
  { id: 8, T: '9', R: '1', B: '1', L: '8' },
  { id: 3, T: '10', R: '2', B: '4', L: '9' },
  { id: 6, T: '7', R: '1', B: '6', L: '6' },
  { id: 9, T: '10', R: '2', B: '8', L: '10' },
]

const LAYOUT: Record<number, [number, number]> = {
  1: [0, 0], 4: [0, 1], 7: [0, 2], 10: [0, 3],
  2: [1, 0], 5: [1, 1], 8: [1, 2],
  3: [2, 0], 6: [2, 1], 9: [2, 2],
}

const PATH_CELLS = new Set([1, 2, 3, 4, 5])

function DirLabel({ pos, value, highlight }: { pos: 'top' | 'right' | 'bottom' | 'left'; value?: string; highlight?: boolean }) {
  if (!value) return null
  const positionClass =
    pos === 'top' ? 'left-1/2 top-1 -translate-x-1/2'
    : pos === 'bottom' ? 'left-1/2 bottom-1 -translate-x-1/2'
    : pos === 'left' ? 'left-1 top-1/2 -translate-y-1/2'
    : 'right-1 top-1/2 -translate-y-1/2'
  const isExit = value === '出口'
  return (
    <span
      className={[
        'absolute text-[10px] font-semibold tabular-nums',
        positionClass,
        isExit || highlight ? 'rounded bg-[#3aa657] px-1 text-white' : 'text-bodytext',
      ].join(' ')}
    >
      {value}
    </span>
  )
}

function MazeCell({ cell, highlight }: { cell: CellSpec; highlight?: boolean }) {
  const isBoss = cell.label === '強者'
  const isStart = cell.id === 1
  const colorClass = isBoss
    ? 'border-rausch bg-rausch/10'
    : isStart
      ? 'border-[#2f6fb5] bg-[#2f6fb5]/10'
      : highlight
        ? 'border-hairline bg-surface-strong'
        : 'border-hairline-soft bg-canvas'
  return (
    <div className={['relative aspect-square rounded-lg border p-1.5', colorClass].join(' ')}>
      <div className="absolute left-1.5 top-1 text-[11px] font-bold text-ink">{cell.id}</div>
      <div className="flex h-full w-full items-center justify-center">
        {cell.label ? <span className="text-sm font-bold text-rausch">{cell.label}</span> : null}
      </div>
      <DirLabel pos="top" value={cell.T} highlight={cell.exitDir === 'T'} />
      <DirLabel pos="right" value={cell.R} highlight={cell.exitDir === 'R'} />
      <DirLabel pos="bottom" value={cell.B} highlight={cell.exitDir === 'B'} />
      <DirLabel pos="left" value={cell.L} highlight={cell.exitDir === 'L'} />
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  )
}

function KStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline-soft bg-canvas p-3">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-1 text-base font-semibold tabular-nums text-ink">{value}</div>
    </div>
  )
}

export function DamoMaze() {
  return (
    <section id="dungeon-damo-maze" className="scroll-mt-24 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">大漠 · 轉生之地迷宮解法</h2>
        <p className="mt-2 max-w-3xl text-sm text-bodytext">
          在成都往北的<span className="font-semibold text-ink">大漠</span>中有條路通往
          <span className="font-semibold text-ink">荒漠</span>，荒漠迷宮內由「強者」負責
          <span className="font-semibold text-rausch">轉生</span>。
          每格的四個數字代表<span className="font-semibold text-ink">朝該方向會傳送到哪一格</span>，並非空間排列。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
        <div className="rounded-2xl border border-hairline bg-canvas p-5">
          <div className="text-sm font-semibold text-ink">迷宮地圖（依原圖）</div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, idx) => {
              const row = Math.floor(idx / 4)
              const col = idx % 4
              const cell = CELLS.find((c) => {
                const [r, k] = LAYOUT[c.id]
                return r === row && k === col
              })
              if (!cell) {
                if (row === 1 && col === 3) {
                  return (
                    <div key={idx} className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-hairline-soft p-2 text-center text-[11px] text-muted">
                      進入第一格為 1
                    </div>
                  )
                }
                return <div key={idx} className="aspect-square" />
              }
              return <MazeCell key={cell.id} cell={cell} highlight={PATH_CELLS.has(cell.id)} />
            })}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-muted">
            <Legend color="#2f6fb5" label="入口 (1)" />
            <Legend color="#ff385c" label="強者 (5)" />
            <Legend color="#3aa657" label="出口 (R 出 1)" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-hairline bg-canvas p-5">
            <div className="text-sm font-semibold text-ink">快速到達法</div>
            <p className="mt-2 text-sm text-bodytext">進入第一格 (1) 後，依序：</p>
            <ol className="mt-3 space-y-2 text-sm">
              {[
                { dir: '上', from: 1, to: 2 },
                { dir: '右', from: 2, to: 3 },
                { dir: '下', from: 3, to: 4 },
                { dir: '右', from: 4, to: 5 },
              ].map((s, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-strong text-xs font-bold text-ink">{i + 1}</span>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-rausch/10 text-sm font-bold text-rausch">{s.dir}</span>
                  <span className="text-sm text-bodytext">
                    從 <b className="tabular-nums">{s.from}</b> → <b className="tabular-nums">{s.to}</b>
                    {s.to === 5 ? '（強者：完成轉生對話）' : ''}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-hairline bg-canvas p-5">
            <div className="text-sm font-semibold text-ink">轉生條件</div>
            <ul className="mt-3 space-y-1.5 text-sm text-bodytext">
              <li><span className="font-semibold text-ink">年齡：</span>滿 101 歲</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-rausch-disabled bg-rausch/5 p-5">
            <div className="text-sm font-semibold text-ink">轉生前建議數值</div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <KStat label="基拳 / 基輕" value="500 級" />
              <KStat label="基內" value="550 級" />
              <KStat label="讀書" value="700 級" />
              <KStat label="內力" value="5,500" />
              <KStat label="精力" value="1,650" />
            </div>
            <p className="mt-3 text-xs text-muted">建議於轉生前先把以上數值衝至門檻，避免轉生後重練吃力。</p>
          </div>
        </div>
      </div>
    </section>
  )
}
