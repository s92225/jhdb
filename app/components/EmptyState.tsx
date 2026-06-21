import Link from 'next/link'

export function EmptyState({
  title,
  description,
  backHref = '/',
  backText = '回首頁',
}: {
  title: string
  description: string
  backHref?: string
  backText?: string
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-canvas p-10 text-center">
      <div className="text-lg font-semibold text-ink">{title}</div>
      <div className="mt-2 text-muted">{description}</div>
      <div className="mt-4">
        <Link className="text-sm font-medium text-rausch hover:text-rausch-active" href={backHref}>
          {backText}
        </Link>
      </div>
    </div>
  )
}

export default EmptyState
