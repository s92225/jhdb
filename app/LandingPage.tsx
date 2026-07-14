'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Swords,
  ChevronDown,
  ScrollText,
  BookOpen,
  Castle,
  Check,
  ArrowRight,
  Clock,
} from 'lucide-react'

type TabKey = 'skills' | 'quests' | 'manuals' | 'dungeons'

const TABS: { key: TabKey; label: string; icon: typeof Swords }[] = [
  { key: 'skills', label: '武技', icon: Swords },
  { key: 'quests', label: '任務', icon: ScrollText },
  { key: 'manuals', label: '秘笈', icon: BookOpen },
  { key: 'dungeons', label: '副本', icon: Castle },
]

const TAB_ORDER: TabKey[] = ['skills', 'quests', 'manuals', 'dungeons']

type UpdateItem = {
  id: string
  date?: string | null
  title?: string | null
  content: string
}

export default function V2LandingPage({ updates }: { updates: UpdateItem[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>('skills')

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const idx = TAB_ORDER.indexOf(prev)
        return TAB_ORDER[(idx + 1) % TAB_ORDER.length]
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', 'Noto Sans TC', sans-serif" }}>
      {/* Navigation */}
      <nav
        className="animate-fade-in-up relative z-50 mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        style={{ opacity: 0, animationDelay: '0.1s' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <Swords className="h-5 w-5 fill-black" />
          <span className="text-lg font-semibold text-black">人在江湖資料庫</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <div className="group relative">
            <Link href="/skills" className="flex items-center gap-1 text-sm text-gray-700 hover:text-black">
              武學 <ChevronDown className="h-4 w-4" />
            </Link>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="w-44 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                <Link href="/skills" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">武技總覽</Link>
                <Link href="/skills/compare" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">多選比較</Link>
                <Link href="/skills/simulator" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">特效模擬器</Link>
              </div>
            </div>
          </div>
          <div className="group relative">
            <Link href="/guides/quests" className="flex items-center gap-1 text-sm text-gray-700 hover:text-black">
              攻略 <ChevronDown className="h-4 w-4" />
            </Link>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="w-44 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                <Link href="/guides/quests" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">任務流程</Link>
                <Link href="/guides/dungeons" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">副本資訊</Link>
                <Link href="/guides/masters" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">師傅給物</Link>
                <Link href="/guides/attributes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">屬性獲得表</Link>
              </div>
            </div>
          </div>
          <Link href="/equipment" className="text-sm text-gray-700 hover:text-black">
            裝備
          </Link>
          <Link href="/systems" className="text-sm text-gray-700 hover:text-black">
            系統
          </Link>
          <div className="group relative">
            <Link href="/tools" className="flex items-center gap-1 text-sm text-gray-700 hover:text-black">
              工具 <ChevronDown className="h-4 w-4" />
            </Link>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="w-44 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                <Link href="/tools/dazuo" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">打坐計算</Link>
                <Link href="/tools/macros" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">按精教程</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/updates" className="text-sm text-gray-700 hover:text-black">
            更新日誌
          </Link>
          <Link
            href="/skills"
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            開始探索
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pb-8 pt-24 text-center">
        {/* Reviews Badge */}
        <div
          className="animate-fade-in-up mb-8 inline-flex items-center gap-2"
          style={{ opacity: 0, animationDelay: '0.2s' }}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded border border-gray-300">
            <Swords className="h-3.5 w-3.5 fill-black" />
          </div>
          <span className="text-sm font-medium text-black">
            收錄 200+ 武技 · 50+ 任務 · 持續更新中
          </span>
        </div>

        {/* Main Heading */}
        <h1
          className="animate-fade-in-up mb-5 text-6xl font-normal leading-[1.1] tracking-tight md:text-7xl lg:text-[80px]"
          style={{ opacity: 0, animationDelay: '0.3s' }}
        >
          查得快。比得準。
          <br />
          <span className="bg-gradient-to-r from-black via-gray-500 to-gray-400 bg-clip-text text-transparent">
            江湖資料一手掌握。
          </span>
        </h1>

        {/* Subheading */}
        <p
          className="animate-fade-in-up mx-auto mb-8 max-w-2xl text-lg text-gray-600 md:text-xl"
          style={{ opacity: 0, animationDelay: '0.4s' }}
        >
          想學哪招武技？不知道任務怎麼解？秘笈去哪拿？這裡幫你把江湖大小事整理好，搜一搜就找到。
        </p>

        {/* CTA Button */}
        <div
          className="animate-fade-in-up mb-12"
          style={{ opacity: 0, animationDelay: '0.5s' }}
        >
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
          >
            開始探索 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Tab Bar */}
        <div
          className="animate-fade-in-up mx-auto flex max-w-md justify-center"
          style={{ opacity: 0, animationDelay: '0.6s' }}
        >
          {/* Mobile: 2x2 grid */}
          <div className="grid w-full grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 md:hidden">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                    active ? 'bg-white text-black shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
          {/* Desktop: row with dividers */}
          <div className="hidden w-full items-center gap-1 rounded-lg bg-gray-100 p-1 md:flex">
            {TABS.map((tab, i) => {
              const Icon = tab.icon
              const active = activeTab === tab.key
              return (
                <div key={tab.key} className="flex items-center">
                  {i > 0 && <div className="mx-1 h-5 w-px bg-gray-300" />}
                  <button
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium transition-all ${
                      active ? 'bg-white text-black shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Video + Overlay Section */}
        <div
          className="animate-fade-in-up relative mt-8 h-[400px] overflow-hidden rounded-3xl md:h-[500px]"
          style={{ opacity: 0, animationDelay: '0.7s' }}
        >
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_165750_358b1e72-c921-48b7-aaac-f200994f32fb.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />

          {/* Overlay: 武技 */}
          {activeTab === 'skills' && (
            <div className="animate-fade-in-overlay absolute inset-0 flex items-center justify-center bg-black/40">
              <div
                className="animate-slide-up-overlay absolute left-1/2 top-1/2 w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <h3 className="mb-1 text-lg font-semibold text-black">武技比較</h3>
                <p className="mb-4 text-sm text-gray-500">設定你的篩選條件，逐步比較</p>
                <div className="mb-4 h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-purple-500" style={{ width: '25%' }} />
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: '選擇武技', done: true },
                    { label: '篩選類型', done: true },
                    { label: '多選比較', done: false },
                    { label: '查看特效', done: false },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-2 text-sm">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${
                          step.done ? 'bg-purple-500 text-white' : 'border border-gray-300 text-gray-300'
                        }`}
                      >
                        {step.done && <Check className="h-3 w-3" />}
                      </div>
                      <span className={step.done ? 'text-black' : 'text-gray-400'}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Overlay: 任務 */}
          {activeTab === 'quests' && (
            <div className="animate-fade-in-overlay absolute inset-0 flex items-center justify-center bg-black/40">
              <div
                className="animate-slide-up-overlay absolute left-1/2 top-1/2 w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <h3 className="mb-1 text-lg font-semibold text-black">任務流程攻略</h3>
                <p className="mb-4 text-sm text-gray-500">各類任務詳細攻略步驟</p>
                <div className="mb-4 h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-orange-500" style={{ width: '67%' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '任務總數', value: '50+' },
                    { label: '攻略完成', value: '45' },
                    { label: '更新中', value: '5' },
                    { label: '附帶條件', value: '30+' },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-lg bg-orange-50 p-3">
                      <div className="text-xl font-bold text-orange-600">{metric.value}</div>
                      <div className="text-xs text-gray-500">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Overlay: 秘笈 */}
          {activeTab === 'manuals' && (
            <div className="animate-fade-in-overlay absolute inset-0 flex items-center justify-center bg-black/40">
              <div
                className="animate-slide-up-overlay absolute left-1/2 top-1/2 w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <h3 className="mb-1 text-lg font-semibold text-black">武功秘笈收錄</h3>
                <p className="mb-4 text-sm text-gray-500">秘笈取得方式一覽</p>
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">120 / 120</div>
                  <div className="mt-1 text-sm text-gray-500">秘笈已收錄</div>
                </div>
              </div>
            </div>
          )}

          {/* Overlay: 副本 */}
          {activeTab === 'dungeons' && (
            <div className="animate-fade-in-overlay absolute inset-0 flex items-center justify-center bg-black/40">
              <div
                className="animate-slide-up-overlay absolute left-1/2 top-1/2 w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <h3 className="mb-1 text-lg font-semibold text-black">副本資訊總覽</h3>
                <p className="mb-4 text-sm text-gray-500">流程、BOSS、掉落物一次看</p>
                <div className="space-y-2.5">
                  {[
                    'BOSS 資訊',
                    '掉落物',
                    '流程攻略',
                    '副本人數',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-black">{item}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/guides/dungeons"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  前往查看 <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Latest Updates */}
      <section
        className="animate-fade-in-up mx-auto max-w-7xl px-6"
        style={{ opacity: 0, animationDelay: '0.8s' }}
      >
        <div className="mt-12">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <h2 className="text-2xl font-semibold text-black">最新更新</h2>
            </div>
            <Link
              href="/updates"
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black"
            >
              查看全部 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {updates.slice(0, 8).map((u) => {
              const summary = String(u.content || '').split('\n')[0]
              const dateLabel = u.date || u.title || '—'
              return (
                <Link
                  key={u.id}
                  href="/updates"
                  className="flex gap-4 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="w-28 shrink-0 text-sm font-medium text-gray-400">
                    {dateLabel}
                  </div>
                  <div className="line-clamp-2 text-sm leading-relaxed text-gray-700">
                    {summary}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Data Source */}
      <section
        className="animate-fade-in-up mx-auto max-w-7xl px-6"
        style={{ opacity: 0, animationDelay: '0.9s' }}
      >
        <div className="mt-16 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-400">資料來源 · 寒江湖</span>
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="h-24" />
    </div>
  )
}
