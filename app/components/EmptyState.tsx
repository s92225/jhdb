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
    <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-2 text-zinc-700">{description}</div>
      <div className="mt-4">
        <Link className="text-sm" href={backHref}>
          {backText}
        </Link>
      </div>
    </div>
  )
}

export default EmptyState
