import './globals.css'
import './forum.css'
import './guides.css'
import './readability.css'
import './wuxia-home.css'
import './wuxia-reference.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { LayoutShell } from './components/LayoutShell'
import { buildSearchIndex } from '@/lib/searchIndex'

const serif = localFont({
  src: '../public/fonts/jhdb-serif-tc.woff',
  weight: '500',
  variable: '--font-display',
  display: 'swap',
})

const notoSansTC = localFont({
  src: [
    { path: '../public/fonts/jhdb-sans-tc.woff', weight: '400' },
    { path: '../public/fonts/jhdb-sans-tc-medium.woff', weight: '500' },
  ],
  variable: '--font-tc',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: '人在江湖資料庫 · JHDB', template: '%s' },
  description: '寒江湖 MUD 玩家參考：武技比較、任務攻略、秘笈線索、氣勢系統與實用計算器。資料對照官方公告，未確認數據留白。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchEntries = buildSearchIndex()
  return (
    <html lang="zh-Hant" className={`${serif.variable} ${notoSansTC.variable}`}>
      <body className="font-sans">
        <LayoutShell searchEntries={searchEntries}>
          {children}
        </LayoutShell>
      </body>
    </html>
  )
}
