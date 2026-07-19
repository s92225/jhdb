'use client'

import { usePathname } from 'next/navigation'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { FeedbackWidget } from './FeedbackWidget'
import type { SearchEntry } from '@/lib/searchIndex'

export function LayoutShell({
  children,
  searchEntries,
}: {
  children: React.ReactNode
  searchEntries: SearchEntry[]
}) {
  const pathname = usePathname() || '/'
  const isLanding = pathname === '/'

  if (isLanding) {
    return (
      <>
        {children}
        <FeedbackWidget />
      </>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader searchEntries={searchEntries} />
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <SiteFooter />
      <FeedbackWidget />
    </div>
  )
}
