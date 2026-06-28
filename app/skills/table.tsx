'use client'

import { useMemo, useState } from 'react'
import type { Skill, SkillConfig, SkillTier } from '@/lib/types'
import Link from 'next/link'
import { Badge } from '@/app/components/Badge'

type SortKey = 'name' | 'family' | 'tier' | 'avgNei' | 'avgBi' | 'avgShan' | 'avgZhao' | 'score'

function n(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}
function show(v: unknown) {
  if (v === null || v === undefined || v === '') return '—'
  return String(v)
}

function tagClass(label: string) {
  const key = label.trim()
  if (key === '拳腳') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (key === '劍法') return 'border-blue-200 bg-blue-50 text-blue-700'
  if (key === '刀法') return 'border-amber-200 bg-amber-50 text-amber-700'
  if (key === '棍法') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (key === '短兵') return 'border-teal-200 bg-teal-50 text-teal-700'
  if (key === '招架') return 'border-slate-200 bg-slate-50 text-slate-700'
  if (key === '輕功') return 'border-indigo-200 bg-indigo-50 text-indigo-700'
  if (key === '內功') return 'border-purple-200 bg-purple-50 text-purple-700'
  return 'border-hairline bg-surface-soft text-muted'
}

function getNeiliReq(skill: Skill): number | null {
  const req = (skill as any).requirement
  if (req && typeof req === 'object') {
    const v = Number(req.neili)
    if (Number.isFinite(v)) return v
  }
  return null
}

function getAvgTotalDamage(skill: Skill): number | null {
  const nei = n(skill.averages?.neishang)
  const bi = n(skill.averages?.bishang)
  if (nei === null && bi === null) return null
  return (nei ?? 0) + (bi ?? 0)
}

function calcAvgDamage(skill: Skill): number | null {
  const moves = Array.isArray(skill.moves) ? skill.moves : []
  if (moves.length === 0) return null

  let total = 0
  let count = 0
  for (const m of moves) {
    const nei = n(m.neishang) ?? 0
    const bi = n(m.bishang) ?? 0
    total += nei + bi
    count += 1
  }
  if (count === 0) return null
  return Math.round(total / count)
}

function norm(value: number | null, min: number, max: number) {
  if (value === null || !Number.isFinite(value)) return null
  if (max <= min) return 0
  return Math.min(1, Math.max(0, (value - min) / (max - min)))
}

function calcDotHpDamage(skill: Skill): number {
  const effects = (skill as any).specialEffects ?? []
  let totalDot = 0
  for (const e of effects) {
    if (e.type === '暗勁' || e.type === '毒性' || e.type === '寒毒') {
      const chance = e.triggerChance ?? 0
      const maxStacks = e.maxStacks ?? 0
      const hpPerStack = e.hpPerStack ?? 0
      totalDot += chance * maxStacks * hpPerStack
    }
  }
  return totalDot
}

function getScoreRanges(skills: Skill[]) {
  const vals = {
    neishang: [] as number[],
    bishang: [] as number[],
    beishan: [] as number[],
    beizhao: [] as number[],
    dotHp: [] as number[],
  }
  for (const s of skills) {
    const nei = n(s.averages?.neishang)
    const bi = n(s.averages?.bishang)
    const shan = n(s.averages?.beishan)
    const zhao = n(s.averages?.beizhao)
    const dot = calcDotHpDamage(s)
    if (nei !== null) vals.neishang.push(nei)
    if (bi !== null) vals.bishang.push(bi)
    if (shan !== null) vals.beishan.push(shan)
    if (zhao !== null) vals.beizhao.push(zhao)
    vals.dotHp.push(dot)
  }
  const range = (arr: number[]) => {
    if (!arr.length) return { min: 0, max: 0 }
    return { min: Math.min(...arr), max: Math.max(...arr) }
  }
  return {
    neishang: range(vals.neishang),
    bishang: range(vals.bishang),
    beishan: range(vals.beishan),
    beizhao: range(vals.beizhao),
    dotHp: range(vals.dotHp),
  }
}

function calcScore(skill: Skill, ranges: ReturnType<typeof getScoreRanges>): number | null {
  const nei = norm(n(skill.averages?.neishang), ranges.neishang.min, ranges.neishang.max)
  const bi = norm(n(skill.averages?.bishang), ranges.bishang.min, ranges.bishang.max)
  const shan = norm(n(skill.averages?.beishan), ranges.beishan.min, ranges.beishan.max)
  const zhao = norm(n(skill.averages?.beizhao), ranges.beizhao.min, ranges.beizhao.max)
  if (nei === null || bi === null || shan === null || zhao === null) return null
  
  const dotHp = calcDotHpDamage(skill)
  const dotNorm = norm(dotHp, ranges.dotHp.min, ranges.dotHp.max) ?? 0
  
  const raw = 0.20 * nei + 0.20 * bi + 0.20 * (1 - shan) + 0.20 * (1 - zhao) + 0.20 * dotNorm
  return Math.round(raw * 100)
}

type ScoreThresholds = {
  s: number
  a: number
  b: number
  c: number
  d: number
}

function scoreToGrade(score: number | null, thresholds: ScoreThresholds | null) {
  if (score === null || !thresholds) return '—'
  if (score >= thresholds.s) return 'S'
  if (score >= thresholds.a) return 'A'
  if (score >= thresholds.b) return 'B'
  if (score >= thresholds.c) return 'C'
  if (score >= thresholds.d) return 'D'
  return 'E'
}

const scoreTooltip =
  '公式：0.20×內傷 + 0.20×臂傷 + 0.20×(1-被閃) + 0.20×(1-被招) + 0.20×暗勁傷害（皆以資料集 min/max 正規化）\n暗勁傷害 = 觸發機率 × 疊加上限 × 每層氣血傷害\n等級：依分位數分級（S 前 16.7% / A 前 33.4% / B 前 50% / C 前 66.7% / D 前 83.4% / E 最後 16.7%）\n\n【閃避率加成】組合技能效果，戰鬥中配置指定輕功達等級要求時，獲得額外閃避率（30%~70%），敵方攻擊有該機率完全閃避。'

function sourceTagClass(label: string) {
  const key = label.trim()
  if (key === '公共武技') return 'border-slate-200 bg-slate-50 text-slate-700'
  if (key === '少林') return 'border-amber-200 bg-amber-50 text-amber-700'
  if (key === '武當') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (key === '明教') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (key === '峨嵋') return 'border-purple-200 bg-purple-50 text-purple-700'
  if (key === '武館') return 'border-blue-200 bg-blue-50 text-blue-700'
  return 'border-hairline bg-surface-soft text-muted'
}

export function SkillTable({
  skills,
  initialFamily = '全部',
}: {
  skills: Skill[]
  initialFamily?: string
}) {
  const [q, setQ] = useState('')
  const [family, setFamily] = useState<string>(initialFamily) // 門派（含 公共武技/武館）
  const [tier, setTier] = useState<SkillTier | '全部'>('全部')
  const [configFilters, setConfigFilters] = useState<Set<string>>(new Set())

  // Range filter bounds derived from the dataset
  const neiliBounds = useMemo(() => {
    const vals = skills.map(getNeiliReq).filter((v): v is number => v !== null)
    if (!vals.length) return { min: 0, max: 0 }
    return { min: Math.min(...vals), max: Math.max(...vals) }
  }, [skills])
  const avgDmgBounds = useMemo(() => {
    const vals = skills.map(getAvgTotalDamage).filter((v): v is number => v !== null)
    if (!vals.length) return { min: 0, max: 0 }
    return { min: Math.floor(Math.min(...vals)), max: Math.ceil(Math.max(...vals)) }
  }, [skills])

  const [neiliEnabled, setNeiliEnabled] = useState(false)
  const [neiliMaxCap, setNeiliMaxCap] = useState<number>(neiliBounds.max)
  const [avgDmgEnabled, setAvgDmgEnabled] = useState(false)
  const [avgDmgMinCap, setAvgDmgMinCap] = useState<number>(avgDmgBounds.min)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selected, setSelected] = useState<string[]>([])

  const configs: string[] = ['拳腳', '劍法', '刀法', '棍法', '短兵', '招架', '輕功', '內功', '連擊進攻', '兵器加成', '組合技能', '暗勁效果']
  const tiers: Array<SkillTier | '全部'> = ['全部', '第一階', '第二階', '第三階', '上古傳承無上神武']

  const familyOptions = useMemo(() => {
    const set = new Set<string>()
    for (const s of skills as any[]) {
      const v = typeof s?.sourceTag === 'string' ? s.sourceTag.trim() : ''
      if (v) set.add(v)
    }
    return ['全部', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-Hant'))]
  }, [skills])

  const scoreRanges = useMemo(() => getScoreRanges(skills), [skills])
  const scoreThresholds = useMemo(() => {
    const values = skills
      .map((s) => calcScore(s, scoreRanges))
      .filter((v): v is number => typeof v === 'number')
      .sort((a, b) => a - b)

    if (!values.length) return null

    const at = (p: number) => values[Math.floor((values.length - 1) * p)]
    return {
      s: at(5 / 6),
      a: at(4 / 6),
      b: at(3 / 6),
      c: at(2 / 6),
      d: at(1 / 6),
    }
  }, [skills, scoreRanges])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()

    return skills.filter((s) => {
      if (needle) {
        const hay = [s.name, s.sect ?? '', s.sourceTag ?? '', s.tier ?? '', (s.configs ?? []).join(',')].join(' ').toLowerCase()
        if (!hay.includes(needle)) return false
      }
      if (family !== '全部' && (s.sourceTag ?? '') !== family) return false
      const rowTier = String((s as any).tier ?? (s as any).stage ?? '').trim()
if (tier !== '全部' && rowTier !== tier) return false

      if (configFilters.size > 0) {
        const matchesConfig = Array.from(configFilters).every((cf) => {
          if (cf === '連擊進攻') {
            return (s as any).specialEffects?.some((e: any) => e.type === '連擊進攻')
          } else if (cf === '兵器加成') {
            return (s as any).weaponBonus?.length > 0
          } else if (cf === '組合技能') {
            return !!(s as any).comboSkill
          } else if (cf === '暗勁效果') {
            return (s as any).specialEffects?.some((e: any) => e.type === '暗勁' || e.type === '毒性' || e.type === '寒毒')
          } else {
            return (s.configs ?? []).includes(cf as SkillConfig)
          }
        })
        if (!matchesConfig) return false
      }
      if (neiliEnabled) {
        const need = getNeiliReq(s)
        // If we don't know the requirement, treat as failing the cap (conservative).
        if (need === null || need > neiliMaxCap) return false
      }
      if (avgDmgEnabled) {
        const avg = getAvgTotalDamage(s)
        if (avg === null || avg < avgDmgMinCap) return false
      }
      return true
    })
  }, [skills, q, family, tier, configFilters, neiliEnabled, neiliMaxCap, avgDmgEnabled, avgDmgMinCap])

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1

    const getValue = (s: Skill): string | number | null => {
      switch (sortKey) {
        case 'name':
          return s.name
        case 'family':
          return s.sourceTag ?? ''
        case 'tier':
          return s.tier ?? ''
        case 'avgNei':
          return n(s.averages?.neishang)
        case 'avgBi':
          return n(s.averages?.bishang)
        case 'avgShan':
          return n(s.averages?.beishan)
        case 'avgZhao':
          return n(s.averages?.beizhao)
        case 'score':
          return calcScore(s, scoreRanges)
        default:
          return null
      }
    }

    const arr = [...filtered]
    arr.sort((a, b) => {
      const av = getValue(a)
      const bv = getValue(b)
      if (av === null && bv === null) return 0
      if (av === null) return 1
      if (bv === null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv), 'zh-Hant') * dir
    })
    return arr
  }, [filtered, sortKey, sortDir, scoreRanges])

  const compareHref = useMemo(() => {
    const ids = selected.map(encodeURIComponent).join(',')
    return ids ? `/skills/compare?ids=${ids}` : '/skills/compare'
  }, [selected])

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="rounded-2xl border border-hairline bg-canvas p-4">
          <div className="text-sm font-semibold text-ink">搜尋武技</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="武技名 / 門派..."
            className="mt-3 w-full rounded-xl border border-hairline bg-canvas px-3 py-2 text-sm text-ink"
          />
        </div>

        <div className="rounded-2xl border border-hairline bg-canvas p-4">
          <div className="text-sm font-semibold text-ink">門派篩選</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {familyOptions.map((v) => (
              <button
                key={v}
                onClick={() => setFamily(v)}
                className={`rounded-xl border px-3 py-2 text-sm ${family === v ? 'border-rausch bg-rausch/5 text-rausch' : 'border-hairline bg-canvas text-bodytext hover:bg-surface-soft'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-canvas p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-ink">類型配置</div>
            {configFilters.size > 0 && (
              <button
                onClick={() => setConfigFilters(new Set())}
                className="text-xs text-rausch hover:underline"
              >
                清除
              </button>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-soft">可多選</div>
          <div className="mt-3 space-y-2 text-sm text-bodytext">
            {configs.map((c) => (
              <label key={c} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configFilters.has(c)}
                  onChange={() => {
                    setConfigFilters((prev) => {
                      const next = new Set(prev)
                      if (next.has(c)) next.delete(c)
                      else next.add(c)
                      return next
                    })
                  }}
                  className="rounded"
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-canvas p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-ink">內力需求上限</div>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={neiliEnabled}
                onChange={(e) => {
                  setNeiliEnabled(e.target.checked)
                  if (e.target.checked) setNeiliMaxCap(neiliBounds.max)
                }}
              />
              啟用
            </label>
          </div>
          <p className="mt-1 text-xs text-muted-soft">
            僅顯示「內力需求 ≤ 指定值」的武技
          </p>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={neiliBounds.min}
              max={neiliBounds.max}
              step={50}
              value={neiliMaxCap}
              disabled={!neiliEnabled}
              onChange={(e) => setNeiliMaxCap(Number(e.target.value))}
              className="w-full accent-rausch disabled:opacity-50"
            />
            <span className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums text-ink">
              {neiliMaxCap}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-soft">
            <span>{neiliBounds.min}</span>
            <span>{neiliBounds.max}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-canvas p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-ink">平均傷害下限</div>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={avgDmgEnabled}
                onChange={(e) => {
                  setAvgDmgEnabled(e.target.checked)
                  if (e.target.checked) setAvgDmgMinCap(avgDmgBounds.min)
                }}
              />
              啟用
            </label>
          </div>
          <p className="mt-1 text-xs text-muted-soft">
            僅顯示「平均內傷 + 平均臂傷 ≥ 指定值」的武技
          </p>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={avgDmgBounds.min}
              max={avgDmgBounds.max}
              step={10}
              value={avgDmgMinCap}
              disabled={!avgDmgEnabled}
              onChange={(e) => setAvgDmgMinCap(Number(e.target.value))}
              className="w-full accent-rausch disabled:opacity-50"
            />
            <span className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums text-ink">
              {avgDmgMinCap}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-soft">
            <span>{avgDmgBounds.min}</span>
            <span>{avgDmgBounds.max}</span>
          </div>
        </div>
      </aside>

      <section className="space-y-4">
        <div className="rounded-2xl border border-hairline bg-canvas p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted">共 {sorted.length} 筆</div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={tier} onChange={(e) => setTier(e.target.value as any)} className="rounded-xl border border-hairline bg-canvas px-3 py-2 text-sm text-ink">
                {tiers.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="rounded-xl border border-hairline bg-canvas px-3 py-2 text-sm text-ink">
                <option value="name">排序：名稱</option>
                <option value="family">排序：門派</option>
                <option value="tier">排序：階級</option>
                <option value="avgNei">排序：平均內傷</option>
                <option value="avgBi">排序：平均臂傷</option>
                <option value="avgShan">排序：平均被閃</option>
                <option value="avgZhao">排序：平均被招</option>
                <option value="score">排序：綜合評分</option>
              </select>
              <button
                className="rounded-xl border border-hairline bg-canvas px-3 py-2 text-sm text-ink"
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                title="切換升冪/降冪"
              >
                {sortDir === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-hairline bg-canvas p-10 text-center text-bodytext">沒有資料（或篩選後為空）。</div>
        ) : (
          <div className="space-y-4">
            {sorted.map((s) => (
              <div key={s.id} className="rounded-2xl border border-hairline bg-canvas p-5 transition-shadow hover:shadow-airbnb">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      checked={selected.includes(s.id)}
                      onChange={() => toggle(s.id)}
                      aria-label={`加入比較：${s.name}`}
                    />
                    <div>
                      <div className="mb-2">
                        <Badge className={`text-[11px] font-semibold tracking-wide ${sourceTagClass(show(s.sourceTag))}`}>
                          {show(s.sourceTag)}
                        </Badge>
                      </div>
                      <Link href={`/skills/${encodeURIComponent(s.id)}`} className="text-[18px] font-semibold text-rausch hover:underline">
                        {s.name}
                      </Link>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {Array.isArray(s.configs) && s.configs.length > 0
                          ? s.configs.map((c) => <Badge key={c} className={tagClass(c)}>{c}</Badge>)
                          : <span className="text-muted-soft">—</span>}
                        {(s as any).specialEffects?.some((e: any) => e.type === '連擊進攻') && (
                          <Badge className="border-amber-300 bg-amber-50 text-amber-700">連擊進攻</Badge>
                        )}
                        {(s as any).specialEffects?.some((e: any) => e.type === '暗勁' || e.type === '毒性' || e.type === '寒毒') && (
                          <Badge className="border-cyan-300 bg-cyan-50 text-cyan-700">暗勁效果</Badge>
                        )}
                        {(s as any).weaponBonus?.length > 0 && (
                          <Badge className="border-violet-300 bg-violet-50 text-violet-700">
                            兵器加成
                          </Badge>
                        )}
                        {(s as any).comboSkill && (
                          <Badge className="border-pink-300 bg-pink-50 text-pink-700">
                            組合技能
                          </Badge>
                        )}
                      </div>
                      {(s as any).comboSkill && (
                        <div className="mt-2 rounded-lg bg-pink-50 px-3 py-2 text-xs text-pink-800">
                          <span className="font-medium">組合效果：</span>
                          配置「{(s as any).comboSkill.partner}」達 {(s as any).comboSkill.level} 級 → 閃避率 +{(s as any).comboSkill.bonus}%
                        </div>
                      )}
                      {(s as any).specialEffects?.filter((e: any) => e.type === '暗勁' || e.type === '毒性' || e.type === '寒毒').map((e: any, i: number) => (
                        <div key={i} className="mt-2 rounded-lg bg-cyan-50 px-3 py-2 text-xs text-cyan-800">
                          <span className="font-medium">{e.type}效果：</span>
                          {e.effectName} — {Math.round(e.triggerChance * 100)}% 機率疊加，上限 {e.maxStacks} 層，每層 {e.hpPerStack} 氣血 / {e.spiritPerStack} 精神
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted">
                    <div>{show(s.tier)}</div>
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <span
                        className="text-[35px] font-semibold leading-none text-slate-800"
                        title={scoreTooltip}
                      >
                        {scoreToGrade(calcScore(s, scoreRanges), scoreThresholds)}
                      </span>
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-[10px] text-slate-500"
                        title={scoreTooltip}
                        aria-label="評分公式"
                      >
                        i
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-x-4 gap-y-3 md:grid-cols-4">
                  <Attribute label="內力需求" value={show(s.requirement?.neili)} max={7000} color="bg-indigo-500" />
                  <Attribute label="平均傷害" value={show(calcAvgDamage(s))} max={2000} color="bg-rose-500" />
                  <Attribute label="平均內傷" value={show(s.averages?.neishang)} max={2000} color="bg-emerald-500" />
                  <Attribute label="平均臂傷" value={show(s.averages?.bishang)} max={2000} color="bg-amber-500" />
                  <Attribute label="平均被閃" value={show(s.averages?.beishan)} max={200} color="bg-slate-400" />
                  <Attribute label="平均被招" value={show(s.averages?.beizhao)} max={200} color="bg-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="sticky bottom-4 z-10">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4 rounded-full bg-ink px-6 py-3 text-white shadow-lg">
            <div className="text-sm">{selected.length} 個項目已選取</div>
            <Link
              href={compareHref}
              className="rounded-full bg-canvas px-4 py-2 text-sm text-ink"
              title={selected.length ? `比較 ${selected.length} 個武技` : '先勾選武技再比較'}
            >
              開始比較 →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function Attribute({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: string
  max: number
  color: string
}) {
  const numeric = Number(value)
  const pct = Number.isFinite(numeric) ? Math.min(100, Math.round((numeric / max) * 100)) : 0
  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-[13px] font-semibold text-bodytext">
        <span>{label}</span>
        <span className="tabular-nums text-ink">{value}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-surface-soft">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  max,
  color,
  tooltip,
}: {
  label: string
  value: string
  max: number
  color: string
  tooltip?: string
}) {
  const numeric = Number(value)
  const pct = Number.isFinite(numeric) ? Math.min(100, Math.round((numeric / max) * 100)) : 0
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          {label}
          {tooltip ? (
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-hairline text-[10px] text-muted"
              title={tooltip}
              aria-label={`${label} 說明`}
            >
              i
            </span>
          ) : null}
        </span>
        <span className="text-bodytext">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-surface-soft">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
