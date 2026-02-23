import Link from 'next/link'
import { getStats, getAllUpdates } from '@/lib/data'

export default function HomePage() {
  const stats = getStats()
  const updates = getAllUpdates().slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">人在江湖資料庫</h1>
        <p className="mt-2 text-zinc-700">
          目標：把武技、任務、秘笈與副本資訊整理成可篩選、可比較、可追溯版本的資料庫。<br />
          原則：不造資料；缺的欄位保持空白。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="rounded-xl border bg-zinc-900 px-4 py-2 text-sm text-white" href="/skills">進入武技比較</Link>
          <Link className="rounded-xl border bg-white px-4 py-2 text-sm" href="/skills/compare">快速比較</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="武技" value={stats.skills} href="/skills" />
        <StatCard title="任務" value={stats.quests} href="/quests" />
        <StatCard title="秘笈" value={stats.manuals} href="/manuals" />
        <StatCard title="副本" value={stats.dungeons} href="/dungeons" />
        <StatCard title="師傅" value={stats.masters} href="/masters" />
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">近期更新</h2>
          <Link className="text-sm text-zinc-600 hover:text-zinc-900" href="/updates">
            查看全部 →
          </Link>
        </div>
        {updates.length > 0 ? (
          <div className="mt-4 space-y-3">
            {updates.map((u) => {
              const summary = String(u.content || '').split('\n')[0]
              return (
                <div key={u.id} className="rounded-xl border p-4">
                  <div className="text-sm text-zinc-500">{u.date || u.title || '—'}</div>
                  <div className="mt-2 text-sm text-zinc-700 line-clamp-2">{summary}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-4 text-sm text-zinc-500">尚無更新資料</div>
        )}
      </section>

    </div>
  )
}

function StatCard({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow">
      <div className="text-sm text-zinc-600">{title}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
      <div className="mt-2 text-sm">查看 →</div>
    </Link>
  )
}
