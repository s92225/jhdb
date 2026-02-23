import Link from 'next/link'
import { getAllUpdates } from '@/lib/data'

export default function UpdatesPage() {
  const updates = getAllUpdates()

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">近期更新</h1>
        <p className="mt-2 text-sm text-zinc-600">依時間排序的遊戲更新摘要。</p>
        <div className="mt-3">
          <Link className="text-sm text-zinc-600 hover:text-zinc-900" href="/">
            返回首頁 →
          </Link>
        </div>
      </div>

      {updates.length > 0 ? (
        <div className="space-y-3">
          {updates.map((u) => {
            const summary = String(u.content || '')
            return (
              <div key={u.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="text-sm text-zinc-500">{u.date || u.title || '—'}</div>
                <div className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{summary}</div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-6 text-sm text-zinc-500 shadow-sm">尚無更新資料</div>
      )}
    </div>
  )
}
