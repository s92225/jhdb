import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="rounded-2xl border border-hairline bg-canvas p-10 text-center">
      <div className="text-lg font-semibold text-ink">找不到頁面</div>
      <div className="mt-2 text-bodytext">你要找的資料可能尚未匯入，或 ID 不存在。</div>
      <div className="mt-4">
        <Link href="/" className="text-sm font-medium text-rausch hover:text-rausch-active">回首頁</Link>
      </div>
    </div>
  )
}
