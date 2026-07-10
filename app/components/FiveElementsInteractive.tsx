'use client'

import { useState } from 'react'

type ElKey = '木' | '火' | '土' | '金' | '水'

// Weapon-type → element mapping (per game rules):
// 劍（金）、短兵（水）、刀（火）、棍（木）、拳腳（土）
const ELEMENTS: Array<{
  key: ElKey
  en: string
  color: string
  /** lighter shade for gradient */
  light: string
  /** darker shade for gradient */
  dark: string
  /** weapon type associated with this element */
  weapon: string
  /** small glyph / emoji to evoke the element */
  glyph: string
  x: number
  y: number
}> = [
  { key: '木', en: 'Wood', color: '#3aa657', light: '#6dd58a', dark: '#22773f', weapon: '棍', glyph: '🌿', x: 250, y: 60 },
  { key: '火', en: 'Fire', color: '#e0413a', light: '#ff7a6f', dark: '#a8221b', weapon: '刀', glyph: '🔥', x: 450, y: 190 },
  { key: '土', en: 'Earth', color: '#c98a3a', light: '#e6b070', dark: '#8d5b1d', weapon: '拳腳', glyph: '⛰', x: 370, y: 420 },
  { key: '金', en: 'Metal', color: '#a3a3a3', light: '#d4d4d4', dark: '#6d6d6d', weapon: '劍', glyph: '⚔', x: 130, y: 420 },
  { key: '水', en: 'Water', color: '#2f6fb5', light: '#6aa3df', dark: '#1a4877', weapon: '短兵', glyph: '💧', x: 50, y: 190 },
]

// Generation cycle (相生): each element feeds the next.
const SHENG_NEXT: Record<ElKey, ElKey> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
}

// Overcoming cycle (相剋): each element beats the one two steps away.
const KE_NEXT: Record<ElKey, ElKey> = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木',
}

const SHENG_REASON: Record<ElKey, string> = {
  木: '木燃成火',
  火: '火燒成灰土',
  土: '土中蘊金',
  金: '金屬凝水',
  水: '水養草木',
}
const KE_REASON: Record<ElKey, string> = {
  木: '樹根破土',
  土: '築堤擋水',
  水: '水可滅火',
  火: '火能熔金',
  金: '斧能伐木',
}

type Relation = 'self' | 'sheng-out' | 'sheng-in' | 'ke-out' | 'ke-in'

function relationOf(self: ElKey, target: ElKey): Relation {
  if (self === target) return 'self'
  if (KE_NEXT[self] === target) return 'ke-out' // I beat target
  if (KE_NEXT[target] === self) return 'ke-in' // target beats me
  if (SHENG_NEXT[self] === target) return 'sheng-out' // I feed target
  if (SHENG_NEXT[target] === self) return 'sheng-in' // target feeds me
  return 'self'
}

const RELATION_LABEL: Record<Relation, string> = {
  self: '同屬性 / 中立',
  'sheng-out': '我方生對方（無增益）',
  'sheng-in': '對方生我方 → 攻擊方 +20%',
  'ke-out': '我方剋對方（無增益）',
  'ke-in': '對方剋我方 → 攻擊方 -20%',
}

// 規則：僅由「對方屬性 → 我方屬性」方向觸發。
//   對方生我方 → 攻擊方 +20%
//   對方剋我方 → 攻擊方 -20%
// 反方向 (我方 → 對方) 不觸發。
const SHENG_BONUS = 20
const KE_PENALTY = -20

export function FiveElementsInteractive() {
  const [self, setSelf] = useState<ElKey>('金')
  const [target, setTarget] = useState<ElKey>('土')

  const relation = relationOf(self, target)

  let dmgMod = 0
  if (relation === 'ke-in') dmgMod = KE_PENALTY
  else if (relation === 'sheng-in') dmgMod = SHENG_BONUS

  const byKey = Object.fromEntries(ELEMENTS.map((e) => [e.key, e])) as Record<
    ElKey,
    (typeof ELEMENTS)[number]
  >

  const shrink = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    r: number,
  ) => {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    return {
      x1: a.x + (dx / len) * r,
      y1: a.y + (dy / len) * r,
      x2: b.x - (dx / len) * r,
      y2: b.y - (dy / len) * r,
    }
  }

  const SHENG: Array<[ElKey, ElKey]> = (Object.keys(SHENG_NEXT) as ElKey[]).map(
    (k) => [k, SHENG_NEXT[k]],
  )
  const KE: Array<[ElKey, ElKey]> = (Object.keys(KE_NEXT) as ElKey[]).map(
    (k) => [k, KE_NEXT[k]],
  )

  const isActiveEdge = (a: ElKey, b: ElKey) =>
    (a === self && b === target) || (a === target && b === self)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),360px]">
      {/* SVG */}
      <div className="overflow-hidden rounded-2xl border border-hairline bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm sm:p-6">
        <svg
          viewBox="0 0 500 520"
          className="mx-auto block w-full max-w-[560px]"
          role="img"
          aria-label="五行相生相剋互動圖"
        >
          <defs>
            {/* Radial gradients per element */}
            {ELEMENTS.map((e) => (
              <radialGradient
                key={`grad-${e.key}`}
                id={`grad-${e.key}`}
                cx="35%"
                cy="30%"
                r="75%"
              >
                <stop offset="0%" stopColor={e.light} />
                <stop offset="60%" stopColor={e.color} />
                <stop offset="100%" stopColor={e.dark} />
              </radialGradient>
            ))}
            {/* Drop shadow */}
            <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.25" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="arrow-sheng"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="#3aa657" />
            </marker>
            <marker
              id="arrow-ke"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="#e0413a" />
            </marker>
          </defs>

          {/* Decorative outer pentagon background */}
          <polygon
            points={ELEMENTS.map((e) => `${e.x},${e.y}`).join(' ')}
            fill="rgba(15,23,42,0.025)"
            stroke="rgba(15,23,42,0.08)"
            strokeWidth={1.5}
          />

          {/* 相剋 (curved inside star, dashed red) */}
          {KE.map(([a, b]) => {
            const A = byKey[a]
            const B = byKey[b]
            const { x1, y1, x2, y2 } = shrink(A, B, 40)
            const active = isActiveEdge(a, b)
            // Slight curvature toward center for visual flair
            const cx = 250 + (250 - (A.x + B.x) / 2) * 0.08
            const cy = 230 + (230 - (A.y + B.y) / 2) * 0.08
            return (
              <path
                key={`ke-${a}-${b}`}
                d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                fill="none"
                stroke="#e0413a"
                strokeWidth={active ? 3.5 : 2}
                strokeDasharray="6 5"
                strokeLinecap="round"
                markerEnd="url(#arrow-ke)"
                opacity={active ? 1 : 0.45}
              />
            )
          })}

          {/* 相生 (smooth outer curves, solid green) */}
          {SHENG.map(([a, b]) => {
            const A = byKey[a]
            const B = byKey[b]
            const { x1, y1, x2, y2 } = shrink(A, B, 40)
            // Curve outward from center for elegant ring effect
            const midX = (A.x + B.x) / 2
            const midY = (A.y + B.y) / 2
            const outX = midX + (midX - 250) * 0.12
            const outY = midY + (midY - 230) * 0.12
            const active = isActiveEdge(a, b)
            return (
              <path
                key={`sheng-${a}-${b}`}
                d={`M ${x1} ${y1} Q ${outX} ${outY} ${x2} ${y2}`}
                fill="none"
                stroke="#3aa657"
                strokeWidth={active ? 4 : 2.5}
                strokeLinecap="round"
                markerEnd="url(#arrow-sheng)"
                opacity={active ? 1 : 0.65}
              />
            )
          })}

          {/* Nodes (clickable) */}
          {ELEMENTS.map((e) => {
            const isSelf = e.key === self
            const isTarget = e.key === target
            const isActive = isSelf || isTarget
            const r = isActive ? 44 : 38
            return (
              <g
                key={e.key}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (e.key === self) setTarget(e.key)
                  else if (e.key === target) {
                    setSelf(target)
                    setTarget(self)
                  } else setSelf(e.key)
                }}
              >
                {/* Glow ring for active */}
                {isActive && (
                  <circle
                    cx={e.x}
                    cy={e.y}
                    r={r + 10}
                    fill="none"
                    stroke={isSelf ? '#0f172a' : '#ff385c'}
                    strokeWidth={2.5}
                    opacity={0.9}
                    filter="url(#glow)"
                  />
                )}
                {/* Main filled circle */}
                <circle
                  cx={e.x}
                  cy={e.y}
                  r={r}
                  fill={`url(#grad-${e.key})`}
                  filter="url(#soft-shadow)"
                />
                {/* Inner highlight */}
                <circle
                  cx={e.x - r * 0.3}
                  cy={e.y - r * 0.35}
                  r={r * 0.35}
                  fill="rgba(255,255,255,0.25)"
                  pointerEvents="none"
                />
                {/* Element character */}
                <text
                  x={e.x}
                  y={e.y - 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={30}
                  fontWeight={800}
                  fill="#fff"
                  style={{
                    pointerEvents: 'none',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  {e.key}
                </text>
                <text
                  x={e.x}
                  y={e.y + 22}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={600}
                  fill="rgba(255,255,255,0.85)"
                  letterSpacing={1}
                  style={{ pointerEvents: 'none' }}
                >
                  {e.en.toUpperCase()}
                </text>

                {/* Weapon-type badge below node */}
                <g pointerEvents="none">
                  <rect
                    x={e.x - 30}
                    y={e.y + r + 8}
                    width={60}
                    height={20}
                    rx={10}
                    fill="#fff"
                    stroke={e.color}
                    strokeWidth={1.5}
                  />
                  <text
                    x={e.x}
                    y={e.y + r + 22}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={700}
                    fill={e.dark}
                  >
                    {e.glyph} {e.weapon}
                  </text>
                </g>

                {/* Self / target label */}
                {isActive && (
                  <text
                    x={e.x}
                    y={e.y - r - 14}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={800}
                    fill={isSelf ? '#0f172a' : '#ff385c'}
                    letterSpacing={1}
                  >
                    {isSelf ? '◆ 我方' : '◆ 對方'}
                  </text>
                )}
              </g>
            )
          })}

          {/* Legend */}
          <g transform="translate(20, 500)">
            <line
              x1={0}
              y1={0}
              x2={28}
              y2={0}
              stroke="#3aa657"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <text x={34} y={4} fontSize={12} fill="#0f172a" fontWeight={600}>
              相生 +{SHENG_BONUS}%
            </text>
            <line
              x1={140}
              y1={0}
              x2={168}
              y2={0}
              stroke="#e0413a"
              strokeWidth={2.5}
              strokeDasharray="6 5"
              strokeLinecap="round"
            />
            <text x={174} y={4} fontSize={12} fill="#0f172a" fontWeight={600}>
              相剋 {KE_PENALTY}%
            </text>
            <text x={290} y={4} fontSize={10} fill="#6a6a6a">
              點擊節點切換我方／對方
            </text>
          </g>
        </svg>

        {/* Weapon-type mapping caption */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <span className="font-semibold text-ink">五行對應位置：</span>
          {ELEMENTS.map((e) => (
            <span
              key={e.key}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{
                background: e.color + '15',
                color: e.dark,
              }}
            >
              <span className="font-bold">{e.weapon}</span>
              <span>（{e.key}）</span>
            </span>
          ))}
        </div>
      </div>

      {/* Controls + result */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-hairline bg-canvas p-5">
          <div className="text-sm font-semibold text-ink">選擇五行</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Selector
              label="我方"
              value={self}
              onChange={setSelf}
              accent="#222"
            />
            <Selector
              label="對方"
              value={target}
              onChange={setTarget}
              accent="#ff385c"
            />
          </div>
        </div>

        <div
          className={[
            'rounded-2xl border p-5',
            relation === 'ke-out'
              ? 'border-[#3aa657] bg-[#3aa657]/5'
              : relation === 'ke-in'
                ? 'border-rausch bg-rausch/5'
                : relation === 'sheng-in'
                  ? 'border-[#2f6fb5] bg-[#2f6fb5]/5'
                  : 'border-hairline bg-surface-soft',
          ].join(' ')}
        >
          <div className="text-xs font-medium text-muted">關係</div>
          <div className="mt-1 text-base font-semibold text-ink">
            {RELATION_LABEL[relation]}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-hairline-soft bg-canvas p-3">
              <div className="text-[11px] text-muted">傷害修正</div>
              <div
                className={[
                  'mt-1 text-2xl font-bold tabular-nums',
                  dmgMod > 0
                    ? 'text-[#3aa657]'
                    : dmgMod < 0
                      ? 'text-rausch'
                      : 'text-ink',
                ].join(' ')}
              >
                {dmgMod > 0 ? '+' : ''}
                {dmgMod}%
              </div>
            </div>
            <div className="rounded-xl border border-hairline-soft bg-canvas p-3">
              <div className="text-[11px] text-muted">理由</div>
              <div className="mt-1 text-sm font-medium text-ink">
                {relation === 'ke-out'
                  ? KE_REASON[self]
                  : relation === 'ke-in'
                    ? KE_REASON[target]
                    : relation === 'sheng-in'
                      ? SHENG_REASON[target]
                      : relation === 'sheng-out'
                        ? SHENG_REASON[self]
                        : '同屬性對戰'}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-hairline-soft bg-surface-soft p-4 text-[11px] leading-relaxed text-muted">
          <span className="font-semibold text-ink">採用規則：</span>
          僅當「對方屬性 → 我方屬性」方向時觸發 — 對方生我方 +{SHENG_BONUS}%、對方剋我方 {KE_PENALTY}%；反向 (我方→對方) 不觸發。
        </div>
      </div>
    </div>
  )
}

function Selector({
  label,
  value,
  onChange,
  accent,
}: {
  label: string
  value: ElKey
  onChange: (v: ElKey) => void
  accent: string
}) {
  return (
    <div>
      <div className="text-[11px] font-medium text-muted">{label}</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {ELEMENTS.map((e) => {
          const active = value === e.key
          return (
            <button
              key={e.key}
              type="button"
              onClick={() => onChange(e.key)}
              className="h-9 w-9 rounded-full text-sm font-bold text-white transition-transform"
              style={{
                background: e.color,
                outline: active ? `3px solid ${accent}` : 'none',
                outlineOffset: 2,
                transform: active ? 'scale(1.08)' : 'scale(1)',
              }}
              aria-label={`${label}：${e.key}`}
            >
              {e.key}
            </button>
          )
        })}
      </div>
    </div>
  )
}

