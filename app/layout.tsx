import './globals.css'
import type { Metadata } from 'next'
import { SiteHeader } from './components/SiteHeader'

export const metadata: Metadata = {
  title: '人在江湖資料庫',
  description: '武技比較、任務流程、秘笈取得、以及副本資訊。缺資料處留白。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <div className="min-h-screen">
          <SiteHeader />
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
          <footer className="border-t bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-zinc-600">
              <div>人在江湖資料庫 2026</div>
              <div className="mt-1">資料來源:寒江湖 本網站可能有錯,請以寒江湖為準</div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
