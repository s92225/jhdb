import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SiteHeader } from './components/SiteHeader'
import { SiteFooter } from './components/SiteFooter'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '人在江湖資料庫',
  description: '武技比較、任務流程、秘笈取得、以及副本資訊。缺資料處留白。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" className={inter.variable}>
      <body className="font-sans">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="mx-auto w-full max-w-content flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}
