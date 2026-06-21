import type { Metadata } from 'next'
import Link from 'next/link'
import { getSkills } from '@/lib/data'
import { FiveElementsInteractive } from './FiveElementsInteractive'
import { EffectSimulator } from './EffectSimulator'

export const metadata: Metadata = {
  title: '攻略圖解｜人在江湖資料庫',
  description:
    '五行相生相剋互動圖、大漠轉生迷宮地圖、特效效果模擬器，協助新手規劃配裝。',
}

export default async function GuidesPage() {
  const skills = (await getSkills()) as any[]

  // Slim payload to ship to client.
  const skillsLite = skills.map((s) => ({
    id: String(s?.id ?? ''),
    name: String(s?.name ?? ''),
    sect: (s?.sect ?? s?.sourceTag ?? null) as string | null,
    tier: (s?.tier ?? null) as string | null,
    configs: Array.isArray(s?.configs) ? (s.configs as string[]) : [],
    avgNeishang:
      (s?.averages?.neishang ?? s?.averages?.inner ?? null) as number | null,
    avgBishang:
      (s?.averages?.bishang ?? s?.averages?.arm ?? null) as number | null,
    combo: (() => {
      const c = Array.isArray(s?.specialEffects)
        ? s.specialEffects.find((e: any) => e?.type === '連擊進攻')
        : null
      if (!c) return null
      return {
        triggerChance: Number(c.triggerChance ?? 0),
        hitCount: Number(c.hitCount ?? 0),
        multMin: Number(c.damageMultiplierMin ?? 1),
        multMax: Number(c.damageMultiplierMax ?? 1),
        description: String(c.description ?? '連擊進攻'),
      }
    })(),
    weaponBonus: (() => {
      const wb = Array.isArray(s?.weaponBonus) ? s.weaponBonus[0] : null
      if (!wb) return null
      return {
        weaponName: String(wb.weaponName ?? ''),
        minPct: Number(wb.bonusPercentMin ?? 0),
        maxPct: Number(wb.bonusPercentMax ?? 0),
        description: String(wb.description ?? ''),
      }
    })(),
    comboSkill: s?.comboSkill
      ? {
          partner: String(s.comboSkill.partner ?? ''),
          partnerType: String(s.comboSkill.partnerType ?? ''),
          level: Number(s.comboSkill.level ?? 0),
          bonus: Number(s.comboSkill.bonus ?? 0),
        }
      : null,
    stack: (() => {
      const st = Array.isArray(s?.specialEffects)
        ? s.specialEffects.find((e: any) =>
            ['暗勁', '毒性', '寒毒'].includes(e?.type),
          )
        : null
      if (!st) return null
      return {
        type: String(st.type),
        effectName: String(st.effectName ?? ''),
        triggerChance: Number(st.triggerChance ?? 0),
        maxStacks: Number(st.maxStacks ?? 0),
        hpPerStack: Number(st.hpPerStack ?? 0),
        spiritPerStack: Number(st.spiritPerStack ?? 0),
        description: String(st.description ?? ''),
      }
    })(),
  }))

  return (
    <div className="space-y-14">
      <header>
        <span className="pill">攻略圖解 · Guides</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          攻略圖解
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-bodytext">
          五行系統互動圖、大漠迷宮地圖，以及為玩家規劃配裝設計的特效效果模擬器。
        </p>
        <nav className="mt-5 flex flex-wrap gap-2 text-sm">
          <a href="#five-elements" className="pill hover:bg-surface-soft">
            五行系統
          </a>
          <a href="#simulator" className="pill hover:bg-surface-soft">
            特效模擬器
          </a>
          <a href="#damo-maze" className="pill hover:bg-surface-soft">
            大漠迷宮
          </a>
          <a href="#anran" className="pill hover:bg-surface-soft">
            黯然銷魂掌
          </a>
        </nav>
      </header>

      <section id="five-elements" className="space-y-6 scroll-mt-24">
        <div>
          <h2 className="text-2xl font-bold text-ink">五行相生相剋系統</h2>
          <p className="mt-2 max-w-3xl text-sm text-bodytext">
            點擊節點切換我方／對方，查看
            <span className="font-semibold text-ink">剋制</span>
            或
            <span className="font-semibold text-ink">相生</span>
            產生的傷害修正（對方生我方 +20%、對方剋我方 -20%；反向不觸發）。
          </p>
        </div>
        <FiveElementsInteractive />
      </section>

      <section id="simulator" className="space-y-6 scroll-mt-24">
        <div>
          <h2 className="text-2xl font-bold text-ink">特效效果模擬器</h2>
          <p className="mt-2 max-w-3xl text-sm text-bodytext">
            選擇武技與五行對位，模擬器自動套用該武技的
            <span className="font-semibold text-ink">連擊進攻</span>、
            <span className="font-semibold text-ink">兵器加成</span>、
            <span className="font-semibold text-ink">暗勁／毒性／寒毒疊層</span>
            與
            <span className="font-semibold text-ink">組合技能</span>
            效果，並估算每回合直傷與 DoT。
          </p>
        </div>
        <EffectSimulator skills={skillsLite as any} />
      </section>

      <section id="damo-maze" className="space-y-6 scroll-mt-24">
        <DamoMazeSection />
      </section>

      <section id="anran" className="space-y-6 scroll-mt-24">
        <AnranSection />
      </section>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* 大漠 / 轉生之地 迷宮 — faithful redraw                                    */
/* ──────────────────────────────────────────────────────────────────────── */

// Each cell shows where each direction (上/下/左/右) leads.
// Reading from the photo. "出口" in cell 1 means 右 leads out of the maze.
type CellSpec = {
  id: number
  T?: string
  R?: string
  B?: string
  L?: string
  label?: string
  /** which direction is the maze exit, if any */
  exitDir?: 'T' | 'R' | 'B' | 'L'
}

const CELLS: CellSpec[] = [
  // row 1
  { id: 1, T: '2', R: '出口', B: '7', L: '8', exitDir: 'R' },
  { id: 4, T: '3', R: '5', B: '7', L: '7' },
  { id: 7, T: '4', R: '1', B: '3', L: '6' },
  { id: 10, T: '9', R: '3', B: '—', L: '9' },
  // row 2
  { id: 2, T: '10', R: '3', B: '1', L: '9' },
  { id: 5, T: '1', R: '6', B: '7', L: '4', label: '強者' },
  { id: 8, T: '9', R: '1', B: '1', L: '8' },
  // (the photo's row-2 col-4 is the legend "進入第一格為1")
  // row 3
  { id: 3, T: '10', R: '2', B: '4', L: '9' },
  { id: 6, T: '7', R: '1', B: '6', L: '6' },
  { id: 9, T: '10', R: '2', B: '8', L: '10' },
]

// Spatial layout (row, col) for visual grid:
const LAYOUT: Record<number, [number, number]> = {
  1: [0, 0],
  4: [0, 1],
  7: [0, 2],
  10: [0, 3],
  2: [1, 0],
  5: [1, 1],
  8: [1, 2],
  3: [2, 0],
  6: [2, 1],
  9: [2, 2],
}

// Quick path from cell 1 with directions 上→2, 右→3, 下→4, 右→5
const PATH_CELLS = new Set([1, 2, 3, 4, 5])

function DamoMazeSection() {
  const cellsById = new Map(CELLS.map((c) => [c.id, c]))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">大漠 · 轉生之地迷宮解法</h2>
        <p className="mt-2 max-w-3xl text-sm text-bodytext">
          在成都往北的<span className="font-semibold text-ink">大漠</span>
          中有條路通往
          <span className="font-semibold text-ink">荒漠</span>
          ，荒漠迷宮內由「強者」負責
          <span className="font-semibold text-rausch">轉生</span>。
          每格的四個數字代表
          <span className="font-semibold text-ink">朝該方向會傳送到哪一格</span>
          ，並非空間排列。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
        {/* Faithful 4x3 grid (cell 10 in row 1 col 4, "進入" note in row 2 col 4) */}
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
                    <div
                      key={idx}
                      className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-hairline-soft p-2 text-center text-[11px] text-muted"
                    >
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

        {/* Steps + requirements */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-hairline bg-canvas p-5">
            <div className="text-sm font-semibold text-ink">快速到達法</div>
            <p className="mt-2 text-sm text-bodytext">
              進入第一格 (1) 後，依序：
            </p>
            <ol className="mt-3 space-y-2 text-sm">
              {[
                { dir: '上', from: 1, to: 2 },
                { dir: '右', from: 2, to: 3 },
                { dir: '下', from: 3, to: 4 },
                { dir: '右', from: 4, to: 5 },
              ].map((s, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-strong text-xs font-bold text-ink">
                    {i + 1}
                  </span>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-rausch/10 text-sm font-bold text-rausch">
                    {s.dir}
                  </span>
                  <span className="text-sm text-bodytext">
                    從 <b className="tabular-nums">{s.from}</b> →{' '}
                    <b className="tabular-nums">{s.to}</b>
                    {s.to === 5 ? '（強者：完成轉生對話）' : ''}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-hairline bg-canvas p-5">
            <div className="text-sm font-semibold text-ink">轉生條件</div>
            <ul className="mt-3 space-y-1.5 text-sm text-bodytext">
              <li>
                <span className="font-semibold text-ink">年齡：</span>滿 101 歲
              </li>
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
            <p className="mt-3 text-xs text-muted">
              建議於轉生前先把以上數值衝至門檻，避免轉生後重練吃力。
            </p>
          </div>
        </div>
      </div>
    </div>
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

  // Render directional labels at top/right/bottom/left positions inside cell
  return (
    <div
      className={[
        'relative aspect-square rounded-lg border p-1.5',
        colorClass,
      ].join(' ')}
    >
      {/* cell id (corner) */}
      <div className="absolute left-1.5 top-1 text-[11px] font-bold text-ink">
        {cell.id}
      </div>
      {/* center label */}
      <div className="flex h-full w-full items-center justify-center">
        {cell.label ? (
          <span className="text-sm font-bold text-rausch">{cell.label}</span>
        ) : null}
      </div>
      {/* directional destinations */}
      <DirLabel pos="top" value={cell.T} highlight={cell.exitDir === 'T'} />
      <DirLabel pos="right" value={cell.R} highlight={cell.exitDir === 'R'} />
      <DirLabel pos="bottom" value={cell.B} highlight={cell.exitDir === 'B'} />
      <DirLabel pos="left" value={cell.L} highlight={cell.exitDir === 'L'} />
    </div>
  )
}

function DirLabel({
  pos,
  value,
  highlight,
}: {
  pos: 'top' | 'right' | 'bottom' | 'left'
  value?: string
  highlight?: boolean
}) {
  if (!value) return null
  const positionClass =
    pos === 'top'
      ? 'left-1/2 top-1 -translate-x-1/2'
      : pos === 'bottom'
        ? 'left-1/2 bottom-1 -translate-x-1/2'
        : pos === 'left'
          ? 'left-1 top-1/2 -translate-y-1/2'
          : 'right-1 top-1/2 -translate-y-1/2'
  const isExit = value === '出口'
  return (
    <span
      className={[
        'absolute text-[10px] font-semibold tabular-nums',
        positionClass,
        isExit || highlight
          ? 'rounded bg-[#3aa657] px-1 text-white'
          : 'text-bodytext',
      ].join(' ')}
    >
      {value}
    </span>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      <span>{label}</span>
    </div>
  )
}

function KStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline-soft bg-canvas p-3">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-1 text-base font-semibold tabular-nums text-ink">
        {value}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* 黯然銷魂掌                                                                */
/* ──────────────────────────────────────────────────────────────────────── */

const ANRAN_STEPS = [
  { loc: '峨嵋', npc: '郭襄', text: '詢問《楊過》，會回饋「我也找許久了」' },
  { loc: '成都', npc: '—', text: '傳送至成都後往大漠方向前進' },
  {
    loc: '大漠 · 轉生之地',
    npc: '十大強者',
    text: '進入轉生之地找到《十大強者》',
  },
  { loc: '大漠 · 轉生之地', npc: '十大強者', text: '詢問《楊過》後退出' },
  { loc: '峨嵋', npc: '郭襄', text: '回報《楊過下落》' },
  { loc: '峨嵋', npc: '郭襄', text: '取得《黯然銷魂掌》秘笈' },
]

function AnranSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">黯然銷魂掌取得</h2>
        <p className="mt-2 max-w-3xl text-sm text-bodytext">
          需要完成峨嵋與大漠之間的多段對話任務，最終由郭襄交付秘笈。
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2">
        {ANRAN_STEPS.map((s, i) => (
          <li
            key={i}
            className="flex gap-4 rounded-2xl border border-hairline bg-canvas p-5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rausch text-sm font-bold text-white">
              {i + 1}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-surface-strong px-2 py-0.5 font-medium text-ink">
                  {s.loc}
                </span>
                <span className="text-muted">NPC：{s.npc}</span>
              </div>
              <div className="mt-2 text-sm text-bodytext">{s.text}</div>
            </div>
          </li>
        ))}
      </ol>

      <div className="text-sm text-muted">
        亦可在
        <Link
          href="/manuals#manual-anran-xiaohun-zhang"
          className="mx-1 font-medium text-rausch hover:text-rausch-active"
        >
          武功秘笈
        </Link>
        頁查看本秘笈條目。
      </div>
    </div>
  )
}
