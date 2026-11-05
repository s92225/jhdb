'use client'

import { usePathname } from 'next/navigation'
import { SiteHeader } from './SiteHeader'
import { FeedbackWidget } from './FeedbackWidget'
import type { SearchEntry } from '@/lib/searchIndex'
import { CommunityIdentityProvider } from '../forum/CommunityIdentity'
import { WuxiaFooter } from './WuxiaFooter'

export function LayoutShell({ children, searchEntries }: { children: React.ReactNode; searchEntries: SearchEntry[] }) {
  const pathname = usePathname() || '/'
  const isLanding = pathname === '/'
  const isCommunity = pathname.startsWith('/forum') || pathname === '/account'
  const isGuide = pathname.startsWith('/guides')
  const section = pathname.split('/')[1] || 'home'
  return <CommunityIdentityProvider><div className={`wuxia-site-skin flex min-h-screen flex-col ${isLanding ? 'wuxia-home-skin' : `wuxia-reference-skin ${isCommunity ? 'community-site' : isGuide ? 'reference-site' : ''}`}`}>
    <a href="#main-content" className="skip-link">跳至主要內容</a>
    <SiteHeader searchEntries={searchEntries} />
    <main id="main-content" data-reference-group={section} className={isLanding ? 'flex-1' : isCommunity ? 'community-page site-frame flex-1' : 'inner-page site-frame flex-1'}>{children}</main>
    <WuxiaFooter /><FeedbackWidget />
  </div></CommunityIdentityProvider>
}
