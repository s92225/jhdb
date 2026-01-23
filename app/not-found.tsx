import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
      <div className="text-lg font-semibold">找不到頁面</div>
      <div className="mt-2 text-zinc-700">你要找的資料可能尚未匯入，或 ID 不存在。</div>
      <div className="mt-4">
        <Link href="/" className="text-sm">回首頁</Link>
      </div>
    </div>
  )
}
