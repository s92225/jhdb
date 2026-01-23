'use client'

import { useMemo, useState } from 'react'
import type { Skill, SkillConfig, SkillTier } from '@/lib/types'
import Link from 'next/link'
import { Badge } from '@/app/components/Badge'

type SortKey = 'name' | 'family' | 'tier' | 'avgNei' | 'avgBi' | 'avgShan' | 'avgZhao'

function n(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}
function show(v: unknown) {
  if (v === null || v === undefined || v === '') return '—'
  return String(v)
}

export function SkillTable({ skills }: { skills: Skill[] }) {
  const [q, setQ] = useState('')
  const [family, setFamily] = useState<string>('全部') // 門派（含 公共武技/武館）
  const [tier, setTier] = useState<SkillTier | '全部'>('全部')
  const [config, setConfig] = useState<SkillConfig | '全部'>('全部')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selected, setSelected] = useState<string[]>([])

  const configs: Array<SkillConfig | '全部'> = ['全部', '拳腳', '劍法', '刀法', '棍法', '短兵', '招架', '輕功', '內功']
  const tiers: Array<SkillTier | '全部'> = ['全部', '第一階', '第二階', '第三階', '上古傳承無上神武']

  const familyOptions = useMemo(() => {
    const set = new Set<string>()
    for (const s of skills as any[]) {
      const v = typeof s?.sourceTag === 'string' ? s.sourceTag.trim() : ''
      if (v) set.add(v)
    }
    return ['全部', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-Hant'))]
  }, [skills])

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

      if (config !== '全部' && !(s.configs ?? []).includes(config)) return false
      return true
    })
  }, [skills, q, family, tier, config])

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
  }, [filtered, sortKey, sortDir])

  const compareHref = useMemo(() => {
    const ids = selected.map(encodeURIComponent).join(',')
    return ids ? `/skills/compare?ids=${ids}` : '/skills/compare'
  }, [selected])

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋：武技名 / 門派 / 配置..."
            className="w-full rounded-xl border px-3 py-2 text-sm md:w-72"
          />

          {/* 門派（含 公共武技 / 武館） */}
          <select value={family} onChange={(e) => setFamily(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
            {familyOptions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <select value={tier} onChange={(e) => setTier(e.target.value as any)} className="rounded-xl border px-3 py-2 text-sm">
            {tiers.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <select value={config} onChange={(e) => setConfig(e.target.value as any)} className="rounded-xl border px-3 py-2 text-sm">
            {configs.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="rounded-xl border px-3 py-2 text-sm">
            <option value="name">排序：名稱</option>
            <option value="family">排序：門派</option>
            <option value="tier">排序：階級</option>
            <option value="avgNei">排序：平均內傷</option>
            <option value="avgBi">排序：平均臂傷</option>
            <option value="avgShan">排序：平均被閃</option>
            <option value="avgZhao">排序：平均被招</option>
          </select>

          <button
            className="rounded-xl border bg-white px-3 py-2 text-sm"
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            title="切換升冪/降冪"
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>

          <Link
            href={compareHref}
            className="rounded-xl bg-zinc-900 px-3 py-2 text-sm text-white"
            title={selected.length ? `比較 ${selected.length} 個武技` : '先勾選武技再比較'}
          >
            比較{selected.length ? ` (${selected.length})` : ''}
          </Link>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="p-10 text-center text-zinc-700">沒有資料（或篩選後為空）。</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs text-zinc-600">
                <th className="sticky top-0 w-16 border-b bg-white px-4 py-3">比較</th>
                <th className="sticky top-0 border-b bg-white px-4 py-3">名稱</th>
                <th className="sticky top-0 border-b bg-white px-4 py-3">門派</th>
                <th className="sticky top-0 border-b bg-white px-4 py-3">階級</th>
                <th className="sticky top-0 border-b bg-white px-4 py-3">配置</th>
                <th className="sticky top-0 border-b bg-white px-4 py-3">內力需求</th>
                <th className="sticky top-0 border-b bg-white px-4 py-3">精力需求</th>
                <th className="sticky top-0 border-b bg-white px-4 py-3">平均內傷</th>
                <th className="sticky top-0 border-b bg-white px-4 py-3">平均臂傷</th>
                <th className="sticky top-0 border-b bg-white px-4 py-3">平均被閃</th>
                <th className="sticky top-0 border-b bg-white px-4 py-3">平均被招</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr key={s.id} className="text-sm">
                  <td className="border-b px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selected.includes(s.id)}
                      onChange={() => toggle(s.id)}
                      aria-label={`加入比較：${s.name}`}
                    />
                  </td>

                  <td className="border-b px-4 py-3 font-medium">
                    <Link href={`/skills/${encodeURIComponent(s.id)}`} className="hover:underline">
                      {s.name}
                    </Link>
                  </td>

                  <td className="border-b px-4 py-3">{show(s.sourceTag)}</td>
                  <td className="border-b px-4 py-3">{show(s.tier)}</td>

                  <td className="border-b px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(s.configs) && s.configs.length > 0
                        ? s.configs.map((c) => <Badge key={c}>{c}</Badge>)
                        : <span className="text-zinc-400">—</span>}
                    </div>
                  </td>

                  <td className="border-b px-4 py-3 tabular-nums">{show(s.requirement?.neili)}</td>
                  <td className="border-b px-4 py-3 tabular-nums">{show(s.requirement?.jingli)}</td>

                  <td className="border-b px-4 py-3 tabular-nums">{show(s.averages?.neishang)}</td>
                  <td className="border-b px-4 py-3 tabular-nums">{show(s.averages?.bishang)}</td>
                  <td className="border-b px-4 py-3 tabular-nums">{show(s.averages?.beishan)}</td>
                  <td className="border-b px-4 py-3 tabular-nums">{show(s.averages?.beizhao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
