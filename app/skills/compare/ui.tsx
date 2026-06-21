'use client'

import { useMemo, useState } from 'react'
import type { Skill } from '@/lib/types'
import { Badge } from '@/app/components/Badge'

export function CompareClient({ skills }: { skills: Skill[] }) {
  const [selected, setSelected] = useState<string[]>([])

  const selectedSkills = useMemo(() => {
    return selected.map((id) => skills.find((s) => s.id === id)).filter(Boolean) as Skill[]
  }, [selected, skills])

  const canAdd = selected.length < 6

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-hairline bg-canvas p-4">
        <div className="text-sm font-semibold text-ink">選擇武技</div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <select
            className="rounded-xl border border-hairline bg-canvas px-3 py-2 text-sm text-ink"
            value=""
            onChange={(e) => {
              const v = e.target.value
              if (!v) return
              if (selected.includes(v)) return
              if (!canAdd) return
              setSelected((prev) => [...prev, v])
            }}
          >
            <option value="">（選擇一個武技）</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.sourceTag}{s.sect ? `/${s.sect}` : ''})</option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((s) => (
              <button
                key={s.id}
                className="rounded-full border border-hairline bg-canvas px-3 py-1 text-sm text-bodytext"
                title="點擊移除"
                onClick={() => setSelected((prev) => prev.filter((x) => x !== s.id))}
              >
                {s.name} ✕
              </button>
            ))}
          </div>
        </div>
        {skills.length === 0 ? <div className="mt-3 text-sm text-muted">目前 skills.json 是空的。匯入資料後即可比較。</div> : null}
      </div>

      {selectedSkills.length < 2 ? (
        <div className="rounded-2xl border border-hairline bg-canvas p-10 text-center text-bodytext">
          請至少選 2 個武技。
        </div>
      ) : (
        <div className="rounded-2xl border border-hairline bg-canvas">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="sticky left-0 border-b border-hairline bg-canvas px-4 py-3">欄位</th>
                  {selectedSkills.map((s) => (
                    <th key={s.id} className="border-b border-hairline bg-canvas px-4 py-3">
                      <div className="font-medium text-ink">{s.name}</div>
                      <div className="mt-1 text-[11px] text-muted">{s.sourceTag}{s.sect ? ` · ${s.sect}` : ''} · {s.tier}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.configs.map((c) => <Badge key={c}>{c}</Badge>)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                <Row label="內力需求" values={selectedSkills.map((s) => s.requirement?.neili ?? '')} />
                <Row label="精力需求" values={selectedSkills.map((s) => s.requirement?.jingli ?? '')} />
                <Row label="平均內傷" values={selectedSkills.map((s) => s.averages?.neishang ?? '')} />
                <Row label="平均臂傷" values={selectedSkills.map((s) => s.averages?.bishang ?? '')} />
                <Row label="平均被閃" values={selectedSkills.map((s) => s.averages?.beishan ?? '')} />
                <Row label="平均被招" values={selectedSkills.map((s) => s.averages?.beizhao ?? '')} />
                <Row label="招式數" values={selectedSkills.map((s) => s.moves.length)} />
              </tbody>
            </table>
          </div>

          <div className="border-t border-hairline p-4 text-xs text-muted">
            備註：這頁只對比已存在於 JSON 的欄位；若某欄位在資料源缺失，會顯示空白。
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, values }: { label: string; values: Array<string | number> }) {
  return (
    <tr>
      <td className="sticky left-0 border-b border-hairline-soft bg-canvas px-4 py-3 font-medium text-ink">{label}</td>
      {values.map((v, idx) => (
        <td key={idx} className="border-b border-hairline-soft px-4 py-3 tabular-nums text-bodytext">{v as any}</td>
      ))}
    </tr>
  )
}
