import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SiteHeader } from './components/SiteHeader'

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
          <footer className="border-t border-hairline bg-canvas">
            <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-2">
                <span className="text-base font-semibold text-ink">人在江湖資料庫</span>
                <p className="text-sm text-muted">
                  武技、任務、秘笈與副本資訊整理成可篩選、可比較的資料庫。
                </p>
              </div>
              <div className="mt-6 border-t border-hairline-soft pt-6 text-[13px] text-muted">
                <span>© 2026 人在江湖資料庫</span>
                <span className="mx-2">·</span>
                <span>資料來源：寒江湖。本網站可能有誤，請以遊戲內為準。</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
