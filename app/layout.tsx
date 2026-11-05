import './globals.css'
import './wuxia-home.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { LayoutShell } from './components/LayoutShell'
import { buildSearchIndex } from '@/lib/searchIndex'

const inter = localFont({
  src: '../public/fonts/Inter-variable.ttf',
  weight: '100 900',
  style: 'normal',
  variable: '--font-sans',
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
  title: '人在江湖資料庫',
  description: '武技比較、任務流程、秘笈取得、以及副本資訊。缺資料處留白。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchEntries = buildSearchIndex()
  return (
    <html lang="zh-Hant" className={`${inter.variable} ${notoSansTC.variable}`}>
      <body className="font-sans">
        <LayoutShell searchEntries={searchEntries}>
          {children}
        </LayoutShell>
      </body>
    </html>
  )
}
