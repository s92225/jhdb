import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '遊戲系統總覽｜人在江湖資料庫',
  description: '五行相生相剋、連擊進攻、組合技能、兵器加成、暗勁疊層等特殊系統說明。',
}

const SYSTEMS: Array<{
  title: string
  desc: string
  color: string
  href?: string
  linkLabel?: string
}> = [
  {
    title: '五行相生相剋',
    desc: '劍（金）、短兵（水）、刀（火）、棍（木）、拳腳（土）。死鬥中依雙方使用的基本技能判定：相生 +20% 傷害、相剋 −20% 傷害。',
    color: 'bg-emerald-500',
    href: '/systems/five-elements',
    linkLabel: '互動式五行圖 →',
  },
  {
    title: '連擊進攻',
    desc: '18 種武技有機率連續出招，連擊傷害獨立計算並可再觸發暴擊。',
    color: 'bg-amber-500',
    href: '/skills',
    linkLabel: '查看具備連擊的武技 →',
  },
  {
    title: '組合技能',
    desc: '配置指定武技＋輕功可獲得閃避率加成。',
    color: 'bg-pink-500',
    href: '/skills',
    linkLabel: '查看組合技能配置 →',
  },
  {
    title: '兵器加成',
    desc: '指定兵器搭配對應武技可提升傷害（+50%~+100% 不等）。',
    color: 'bg-violet-500',
    href: '/equipment',
    linkLabel: '查看武器神兵 →',
  },
  {
    title: '暗勁／毒性／寒毒疊層',
    desc: '12 種武技命中時可疊加暗勁、毒性或寒毒層數，造成持續傷害。',
    color: 'bg-cyan-500',
    href: '/skills/simulator',
    linkLabel: '用模擬器估算 DoT →',
  },
  {
    title: '左右互搏之術',
    desc: '技能等級 ≥ 100 且悟性 ≤ 100 時，攻擊命中後最終傷害 ×1.5（主攻與連擊獨立計算），作用於所有加成之後的最終環節。',
    color: 'bg-rose-500',
  },
  {
    title: '招架反震',
    desc: '乾坤大挪移（臂力 ×10）與斗轉星移（悟性 ×20）達 500 級並配置於基本招架時，成功招架必定反震，無視防禦。',
    color: 'bg-slate-500',
  },
]

export default function SystemsPage() {
  return (
    <div className="space-y-10">
      <header>
        <span className="pill">系統 · Game Systems</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">遊戲系統總覽</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-bodytext">
          寒江湖的特殊戰鬥系統一覽。各系統的詳細數值可在
          <Link href="/skills" className="mx-1 font-medium text-rausch hover:text-rausch-active">
            武技總覽
          </Link>
          以「類型配置」篩選，或用
          <Link href="/skills/simulator" className="mx-1 font-medium text-rausch hover:text-rausch-active">
            特效模擬器
          </Link>
          實際估算。
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {SYSTEMS.map((s) => (
          <div key={s.title} className="rounded-2xl border border-hairline bg-canvas p-5">
            <div className="flex items-start gap-3">
              <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${s.color}`} />
              <div className="min-w-0">
                <div className="font-semibold text-ink">{s.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-bodytext">{s.desc}</p>
                {s.href ? (
                  <Link
                    href={s.href}
                    className="mt-3 inline-block text-sm font-medium text-rausch hover:text-rausch-active"
                  >
                    {s.linkLabel}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
