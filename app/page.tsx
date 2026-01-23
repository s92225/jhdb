import Link from 'next/link'
import { getStats } from '@/lib/data'

export default function HomePage() {
  const stats = getStats()

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
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">下一步怎麼補資料</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-zinc-700">
          <li>把你提供的 txt 放進 <code className="rounded bg-zinc-100 px-1">/data/raw</code>（已預放示例）。</li>
          <li>跑匯入腳本（骨架已給）：<code className="rounded bg-zinc-100 px-1">npm run import</code>（需要你補解析規則）。</li>
          <li>匯入後會生成 <code className="rounded bg-zinc-100 px-1">/data/*.json</code>，網站就能顯示與比較。</li>
        </ol>
        <p className="mt-3 text-sm text-zinc-600">提示：目前 JSON 可能是空陣列，這是正常的（因為不能亂填）。</p>
      </div>
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
