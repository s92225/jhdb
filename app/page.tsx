import Link from 'next/link'
import { getStats, getAllUpdates } from '@/lib/data'

const QUICK_LINKS = [
  { href: '/skills', label: '武技比較', icon: '⚔️', desc: '篩選、排序、多選比較武技數據' },
  { href: '/equipment', label: '武器神兵', icon: '🗡️', desc: '神兵取得方式與鑄煉資訊' },
  { href: '/guides/quests', label: '任務流程', icon: '📜', desc: '各類任務詳細攻略步驟' },
  { href: '/guides/dungeons', label: '副本資訊', icon: '🏯', desc: '副本流程、BOSS、掉落物' },
  { href: '/tools/dazuo', label: '打坐計算', icon: '🧘', desc: '估算打坐所需時間' },
  { href: '/equipment/manuals', label: '武功秘笈', icon: '📖', desc: '秘笈取得方式一覽' },
  { href: '/systems', label: '遊戲系統', icon: '🧭', desc: '五行系統與戰鬥機制總覽' },
  { href: '/tools/macros', label: '按精教程', icon: '🤖', desc: '按鍵精靈 + OCR 自動打坐安裝教程' },
]

const FEATURES = [
  { label: '組合技能', desc: '配置指定武技+輕功獲得閃避率加成', color: 'bg-pink-500' },
  { label: '連擊進攻', desc: '18種武技有機率連續出招', color: 'bg-amber-500' },
  { label: '兵器加成', desc: '指定兵器搭配武技傷害提升', color: 'bg-violet-500' },
  { label: '暗勁效果', desc: '12種武技命中時疊加暗勁/毒性傷害', color: 'bg-cyan-500' },
]

const ANNOUNCEMENTS = [
  {
    title: '自動復活系統',
    content: '玩家死亡後若不手動復活，5 分鐘後伺服器會自動將其復活到門派重生點，並補滿所有狀態（氣、精、飽足感、止渴度）。',
    type: 'system',
  },
  {
    title: 'PvP 規則變更',
    content: '發起攻擊者條件：年齡 ≥ 200 歲、戰鬥經驗 ≥ 2000 萬。被攻擊者不再檢查任何年齡與經驗限制。',
    type: 'pvp',
  },
]

export default function HomePage() {
  const stats = getStats()
  const updates = getAllUpdates().slice(0, 3)

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="rounded-3xl border border-hairline bg-surface-soft px-6 py-12 sm:px-10 sm:py-16">
        <span className="pill">資料庫 · Database</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          人在江湖資料庫
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-bodytext">
          武技、任務、秘笈與副本資訊整理成可篩選、可比較的資料庫。資料來源透明，缺的欄位保持空白。
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/skills" className="btn-primary">
            開始探索
          </Link>
          <Link href="/skills/compare" className="btn-secondary">
            快速比較
          </Link>
        </div>
        {/* Stats row */}
        <div className="mt-10 grid grid-cols-3 gap-4 border-t border-hairline pt-8 md:grid-cols-6">
          <MiniStat label="武技" value={stats.skills} />
          <MiniStat label="任務" value={stats.quests} />
          <MiniStat label="秘笈" value={stats.manuals} />
          <MiniStat label="副本" value={stats.dungeons} />
          <MiniStat label="師傅" value={stats.masters} />
          <MiniStat label="更新" value={stats.updates} />
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="text-xl font-semibold text-ink">瀏覽分類</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-hairline bg-canvas p-5 transition-shadow hover:shadow-airbnb"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{link.icon}</span>
                <div>
                  <div className="font-semibold text-ink group-hover:text-rausch">{link.label}</div>
                  <div className="mt-1 text-sm text-muted">{link.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features highlight */}
      <section className="rounded-2xl border border-hairline bg-canvas p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-ink">特殊系統</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${f.color}`} />
              <div>
                <div className="font-medium text-ink">{f.label}</div>
                <div className="mt-0.5 text-sm text-muted">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-sm text-muted">
          在
          <Link href="/skills" className="mx-1 font-medium text-rausch hover:text-rausch-active">
            武技比較
          </Link>
          頁面可透過「類型配置」篩選查看。
        </div>
      </section>

      {/* Recent Updates + Quick Tools */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-hairline bg-canvas p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ink">近期更新</h2>
            <Link className="text-sm font-medium text-rausch hover:text-rausch-active" href="/updates">
              全部 →
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {ANNOUNCEMENTS.map((a, i) => (
              <div key={`ann-${i}`} className="rounded-xl border border-rausch-disabled bg-rausch/5 p-4">
                <span className="text-xs font-semibold text-rausch">📢 公告</span>
                <div className="mt-1 font-medium text-ink">{a.title}</div>
                <div className="mt-1 line-clamp-2 text-sm text-bodytext">{a.content}</div>
              </div>
            ))}
            {updates.map((u) => {
              const summary = String(u.content || '').split('\n')[0]
              return (
                <Link
                  key={u.id}
                  href="/updates"
                  className="block rounded-xl border border-hairline-soft bg-surface-soft p-4 transition-colors hover:border-hairline"
                >
                  <div className="text-xs font-medium text-muted">{u.date || u.title || '—'}</div>
                  <div className="mt-1.5 line-clamp-2 text-sm text-bodytext">{summary}</div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-canvas p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink">快速工具</h2>
          <div className="mt-5 space-y-3">
            <Link href="/tools/dazuo" className="block rounded-xl border border-hairline bg-canvas p-4 transition-shadow hover:shadow-airbnb">
              <div className="font-medium text-ink">🧘 打坐時間計算器</div>
              <div className="mt-1 text-sm text-muted">輸入內力估算打坐時間，或反向計算</div>
            </Link>
            <Link href="/guides/attributes" className="block rounded-xl border border-hairline bg-canvas p-4 transition-shadow hover:shadow-airbnb">
              <div className="font-medium text-ink">📊 屬性獲得表</div>
              <div className="mt-1 text-sm text-muted">各屬性的獲得方式與數值</div>
            </Link>
            <Link href="/guides/masters" className="block rounded-xl border border-hairline bg-canvas p-4 transition-shadow hover:shadow-airbnb">
              <div className="font-medium text-ink">👨‍🏫 師傅給物</div>
              <div className="mt-1 text-sm text-muted">各門派師傅傳授技能條件</div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold tabular-nums text-ink">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  )
}
