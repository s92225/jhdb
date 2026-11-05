import type { ReactNode } from 'react'
import { ReferenceHeading } from './ReferenceHeading'

export function GuideHeader({ title, count, description, children }: { title: string; count?: string; description: string; children?: ReactNode }) {
  return <ReferenceHeading title={title} count={count} description={<p>{description}</p>}>{children && <nav className="guide-shortcuts" aria-label={`${title}相關入口`}>{children}</nav>}</ReferenceHeading>
}
