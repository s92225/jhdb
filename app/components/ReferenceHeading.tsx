import type { ReactNode } from 'react'

/** Quiet chapter headings keep the working controls ahead of decorative artwork. */
export function ReferenceHeading({ title, description, count, children }: {
  title: string
  description: ReactNode
  count?: string
  children?: ReactNode
}) {
  return <header className="reference-heading">
    <div className="reference-heading-copy">
      <div className="reference-title-row"><h1>{title}</h1>{count && <span className="reference-count">{count}</span>}</div>
      <div className="reference-description">{description}</div>
      {children}
    </div>
  </header>
}
