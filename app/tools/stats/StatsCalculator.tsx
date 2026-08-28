'use client'

import { useState, useMemo } from 'react'

// ── helpers ──────────────────────────────────────────────────────────────
const INT = (n: number) => Math.trunc(n)

// ── accent color map (full class names for Tailwind JIT) ─────────────────
const ACCENT_COLORS: Record<string, { text: string; bar: string }> = {
  blue:    { text: 'text-blue-600',    bar: '#2563eb' },
  red:     { text: 'text-red-600',     bar: '#dc2626' },
  green:   { text: 'text-green-600',   bar: '#16a34a' },
  amber:   { text: 'text-amber-600',   bar: '#d97706' },
  purple:  { text: 'text-purple-600',  bar: '#9333ea' },
  teal:    { text: 'text-teal-600',    bar: '#0d9488' },
  indigo:  { text: 'text-indigo-600',  bar: '#4f46e5' },
  slate:   { text: 'text-slate-600',   bar: '#475569' },
  rausch:  { text: 'text-rausch',      bar: '#ff385c' },
}

// ── max attribute values from 屬性獲得概覽表 總計 ──────────────────────
const MAX_STRENGTH     = 840   // 臂力
const MAX_INTELLECT   = 270   // 悟性
const MAX_CONSTITUTION = 820   // 根骨
const MAX_AGILITY     = 820   // 身法

// ── slider component ─────────────────────────────────────────────────────
function Slider({
  label,
  value,
  set,
  min = 0,
  max = 2000,
  step = 1,
  unit = '',
  accent = 'rausch',
}: {
  label: string
  value: number
  set: (v: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  accent?: string
}) {
  const c = ACCENT_COLORS[accent] ?? ACCENT_COLORS.rausch
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-ink">{label}</label>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (!isNaN(v)) set(Math.max(min, Math.min(max, v)))
          }}
          className={`w-24 rounded-lg border border-hairline px-2 py-1 text-right text-sm font-bold tabular-nums ${c.text} focus:outline-none focus:ring-1 focus:ring-current`}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        className="mt-2 w-full cursor-pointer appearance-none rounded-full outline-none"
        style={{
          background: `linear-gradient(to right, ${c.bar} ${pct}%, #ebebeb ${pct}%)`,
          height: '6px',
        }}
      />
    </div>
  )
}

// ── result card ──────────────────────────────────────────────────────────
function ResultCard({
  label,
  value,
  formula,
  accent = 'text-ink',
}: {
  label: string
  value: string | number
  formula?: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-hairline bg-canvas p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${accent}`}>{value}</div>
      {formula && <div className="mt-1 text-[11px] text-muted-soft">{formula}</div>}
    </div>
  )
}

// ── section wrapper ──────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-canvas p-5">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  )
}

// ── main component ───────────────────────────────────────────────────────
export function StatsCalculator() {
  const [悟性, set悟性] = useState(30)
  const [臂力, set臂力] = useState(30)
  const [根骨, set根骨] = useState(30)
  const [身法, set身法] = useState(30)
  const [內力, set內力] = useState(500)
  const [基本內功, set基本內功] = useState(200)
  const [讀書寫字, set讀書寫字] = useState(200)
  const [年齡, set年齡] = useState(20)
  const [道學禪宗, set道學禪宗] = useState(0)
  const [武功等級, set武功等級] = useState(100)

  const calc = useMemo(() => {
    const 消1潛武功經驗_師父 = INT(悟性 / 5) + 1
    const 消1潛武功經驗_秘笈 = INT(悟性 / 6)
    const 消1潛耗精 = INT(150 / 悟性)
    const 內力上限 = 基本內功 * 10
    const 精力上限 = 基本內功 * 3
    const 潛能上限 = 讀書寫字 * 10 + 20
    const 打坐時間秒 = 內力 / 8 + 7
    const 內力回復 = INT(基本內功 / 2) + INT(內力 / 20) + 2
    const 精力回復 = INT(基本內功 / 2) + INT(精力上限 / 20) + 2
    const 武功所需經驗 = INT((武功等級 * 武功等級 * 武功等級) / 30)
    const 武功等級所需經驗 = 武功等級 * 武功等級

    let 氣基礎 = 100 + (年齡 - 14) * 根骨 + INT(內力 / 4)
    if (年齡 > 100) 氣基礎 -= (年齡 - 100) * 20
    if (年齡 > 60) 氣基礎 -= (年齡 - 60) * 20
    if (年齡 > 35) 氣基礎 -= (年齡 - 35) * 20

    let 氣加成 = 0
    let 精加成 = 0
    if (道學禪宗 > 60) {
      氣加成 = 道學禪宗 * 10
      精加成 = 道學禪宗 * 6
    } else if (道學禪宗 > 30) {
      氣加成 = 道學禪宗 * 6
      精加成 = 道學禪宗 * 4
    }
    const 氣總和 = 氣基礎 + 氣加成

    let 精基礎 = 100 + (年齡 - 14) * 根骨 + INT(內力 / 4)
    if (年齡 > 100) 精基礎 -= (年齡 - 100) * 20
    if (年齡 > 60) 精基礎 -= (年齡 - 60) * 20
    if (年齡 > 35) 精基礎 -= (年齡 - 35) * 20
    const 精總和 = 精基礎 + 精加成

    return {
      消1潛武功經驗_師父,
      消1潛武功經驗_秘笈,
      消1潛耗精,
      內力上限,
      精力上限,
      潛能上限,
      打坐時間秒,
      內力回復,
      精力回復,
      武功所需經驗,
      武功等級所需經驗,
      氣總和,
      精總和,
      氣加成,
      精加成,
    }
  }, [悟性, 臂力, 根骨, 身法, 內力, 基本內功, 讀書寫字, 年齡, 道學禪宗, 武功等級])

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)} 秒`
    const mins = seconds / 60
    if (mins < 60) return `${mins.toFixed(1)} 分鐘`
    const hours = mins / 60
    return `${hours.toFixed(2)} 小時`
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-ink">人物屬性計算器</h1>
        <p className="text-sm text-muted">
          調整各項屬性數值，即時計算武功經驗、潛能消耗、氣精總和與回復量。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Inputs */}
        <div className="space-y-4">
          <Section title="基本屬性（上限取自屬性獲得概覽表總計）">
            <div className="space-y-4">
              <Slider label="悟性" value={悟性} set={set悟性} min={1} max={MAX_INTELLECT} accent="blue" />
              <Slider label="臂力" value={臂力} set={set臂力} min={1} max={MAX_STRENGTH} accent="red" />
              <Slider label="根骨" value={根骨} set={set根骨} min={1} max={MAX_CONSTITUTION} accent="green" />
              <Slider label="身法" value={身法} set={set身法} min={1} max={MAX_AGILITY} accent="amber" />
            </div>
          </Section>

          <Section title="技能與內力">
            <div className="space-y-4">
              <Slider label="目前內力上限（已修練）" value={內力} set={set內力} min={0} max={10000} step={50} accent="purple" />
              <Slider label="基本內功" value={基本內功} set={set基本內功} min={0} max={2000} step={10} accent="purple" />
              <Slider label="讀書寫字" value={讀書寫字} set={set讀書寫字} min={0} max={2000} step={10} accent="blue" />
              <Slider label="道學/禪宗心法" value={道學禪宗} set={set道學禪宗} min={0} max={2000} step={10} accent="indigo" />
            </div>
          </Section>

          <Section title="其他">
            <div className="space-y-4">
              <Slider label="年齡" value={年齡} set={set年齡} min={14} max={1000} accent="slate" />
              <Slider label="武功等級" value={武功等級} set={set武功等級} min={1} max={2000} step={1} accent="rausch" />
            </div>
          </Section>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <Section title="消潛與武功經驗">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard label="消 1 潛得到的武功經驗（師父）" value={calc.消1潛武功經驗_師父} formula="INT(悟性/5)+1" accent="text-blue-600" />
              <ResultCard label="消 1 潛得到的武功經驗（秘笈）" value={calc.消1潛武功經驗_秘笈} formula="INT(悟性/6)" accent="text-blue-600" />
              <ResultCard label="消 1 潛耗精" value={calc.消1潛耗精} formula="INT(150/悟性)" accent="text-amber-600" />
              <ResultCard label="武功升至此等級所需總經驗" value={calc.武功所需經驗.toLocaleString()} formula="INT(等級^3/30)" accent="text-rausch" />
              <ResultCard label="此等級所需武功經驗" value={calc.武功等級所需經驗.toLocaleString()} formula="等級^2" accent="text-rausch" />
              <ResultCard label="潛能上限" value={calc.潛能上限.toLocaleString()} formula="讀書寫字x10+20" accent="text-purple-600" />
            </div>
          </Section>

          <Section title="內力 / 精力 / 打坐">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard label="內力可修練理論上限" value={calc.內力上限.toLocaleString()} formula="基本內功x10" accent="text-purple-600" />
              <ResultCard label="精力可修練理論上限" value={calc.精力上限.toLocaleString()} formula="基本內功x3" accent="text-teal-600" />
              <ResultCard label="打坐時間" value={formatTime(calc.打坐時間秒)} formula="內力/8+7 秒" accent="text-indigo-600" />
              <ResultCard label="內力回復量" value={calc.內力回復} formula="INT(內功/2)+INT(內力/20)+2" accent="text-purple-600" />
              <ResultCard label="精力回復量" value={calc.精力回復} formula="INT(內功/2)+INT(精力/20)+2" accent="text-teal-600" />
            </div>
            <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
              理論上限是基本內功允許修練到的最高值，不是角色目前已修練的內力或精力。
            </div>
          </Section>

          <Section title="氣 / 精總和">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard label="氣的總和" value={calc.氣總和.toLocaleString()} formula="100+(歲-14)x根骨+INT(內力/4)+道學/禪宗" accent="text-red-600" />
              <ResultCard label="精的總和" value={calc.精總和.toLocaleString()} formula="100+(歲-14)x根骨+INT(內力/4)+道學/禪宗" accent="text-green-600" />
            </div>
            {年齡 > 35 && (
              <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                ⚠ 年齡超過 35 歲，氣精開始衰減（每歲 -20）
                {年齡 > 60 && '；超過 60 歲再 -20/歲'}
                {年齡 > 100 && '；超過 100 歲再 -20/歲'}
              </div>
            )}
            {道學禪宗 > 0 && (
              <div className="mt-2 text-xs text-muted">
                道學/禪宗心法加成：氣 +{calc.氣加成}、精 +{calc.精加成}
                {道學禪宗 <= 30 && '（<=30 級：無加成）'}
                {道學禪宗 > 30 && 道學禪宗 <= 60 && '（31-60 級：氣每級+6、精每級+4）'}
                {道學禪宗 > 60 && '（>60 級：氣每級+10、精每級+6）'}
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* Formula reference */}
      <div className="rounded-2xl border border-hairline bg-surface-soft p-5">
        <h2 className="text-sm font-semibold text-ink">公式一覽</h2>
        <div className="mt-3 grid gap-2 text-xs text-bodytext sm:grid-cols-2">
          <div className="rounded-lg bg-canvas px-3 py-2"><span className="font-medium text-ink">消1潛武功經驗（師父）</span>：INT(悟性/5)+1</div>
          <div className="rounded-lg bg-canvas px-3 py-2"><span className="font-medium text-ink">消1潛武功經驗（秘笈）</span>：INT(悟性/6)</div>
          <div className="rounded-lg bg-canvas px-3 py-2"><span className="font-medium text-ink">消1潛耗精</span>：INT(150/悟性)</div>
          <div className="rounded-lg bg-canvas px-3 py-2"><span className="font-medium text-ink">內力可修練理論上限</span>：基本內功x10</div>
          <div className="rounded-lg bg-canvas px-3 py-2"><span className="font-medium text-ink">精力可修練理論上限</span>：基本內功x3</div>
          <div className="rounded-lg bg-canvas px-3 py-2"><span className="font-medium text-ink">潛能上限</span>：讀書寫字x10+20</div>
          <div className="rounded-lg bg-canvas px-3 py-2"><span className="font-medium text-ink">打坐時間</span>：內力/8+7 秒</div>
          <div className="rounded-lg bg-canvas px-3 py-2"><span className="font-medium text-ink">內力回復</span>：INT(內功/2)+INT(內力/20)+2</div>
          <div className="rounded-lg bg-canvas px-3 py-2"><span className="font-medium text-ink">精力回復</span>：INT(內功/2)+INT(精力/20)+2</div>
          <div className="rounded-lg bg-canvas px-3 py-2"><span className="font-medium text-ink">武功所需經驗</span>：INT(等級^3/30)</div>
          <div className="rounded-lg bg-canvas px-3 py-2"><span className="font-medium text-ink">武功等級所需經驗</span>：等級^2</div>
          <div className="rounded-lg bg-canvas px-3 py-2"><span className="font-medium text-ink">錢莊重量上限</span>：200,000</div>
        </div>
        <div className="mt-3 rounded-lg bg-canvas px-3 py-2 text-xs text-bodytext">
          <span className="font-medium text-ink">氣的總和</span>：100+(歲數-14)x根骨+INT(內力/4)+道學/禪宗心法加成
          <br />
          <span className="text-muted">年齡衰減：&gt;35 歲每歲 -20、&gt;60 歲再 -20/歲、&gt;100 歲再 -20/歲</span>
          <br />
          <span className="text-muted">道學/禪宗：&gt;30 級氣每級+6、精每級+4；&gt;60 級氣每級+10、精每級+6</span>
        </div>
      </div>
    </div>
  )
}
