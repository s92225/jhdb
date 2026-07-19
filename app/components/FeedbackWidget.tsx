'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function FeedbackWidget() {
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [pageTitle, setPageTitle] = useState('')

  useEffect(() => {
    if (open) {
      setPageTitle(document.title)
      setStatus('idle')
    }
  }, [open, pathname])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!message.trim() || status === 'submitting') return
    setStatus('submitting')

    const form = e.currentTarget
    const botField = (form.elements.namedItem('bot-field') as HTMLInputElement)?.value || ''

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botField,
          page: pageTitle,
          url: typeof window !== 'undefined' ? window.location.href : pathname,
          contact: contact.trim(),
          message: message.trim(),
        }),
      })
      if (!res.ok) throw new Error(`提交失敗（${res.status}）`)
      setStatus('success')
      setMessage('')
      setContact('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="提交數據修正意見"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-rausch px-4 py-3 text-sm font-semibold text-white shadow-airbnb transition-colors hover:bg-rausch-active"
      >
        <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4">
          <path
            d="M4 3.5h12a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 16 14.5H8l-4 3v-3H4A1.5 1.5 0 0 1 2.5 13V5A1.5 1.5 0 0 1 4 3.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden sm:inline">提交意見</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-hairline bg-canvas shadow-airbnb">
            <div className="flex items-center justify-between border-b border-hairline-soft px-5 py-4">
              <div className="min-w-0">
                <div className="text-base font-semibold text-ink">提交數據修正</div>
                <div className="truncate text-xs text-muted">
                  目前頁面：{pageTitle || pathname}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="關閉"
                className="shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-surface-soft hover:text-ink"
              >
                <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5">
                  <path
                    d="M6 6l8 8M14 6l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {status === 'success' ? (
              <div className="px-5 py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft">
                  <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 text-rausch">
                    <path
                      d="M5 13l4 4L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-ink">已收到你的提交，感謝回報！</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary mt-5"
                >
                  關閉
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-4 px-5 py-5">
                <p className="hidden">
                  <label>
                    請勿填寫：<input name="bot-field" />
                  </label>
                </p>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-ink">
                    修正內容 <span className="text-rausch">*</span>
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="請描述哪個數據有誤、正確的數值或內容是什麼…"
                    className="w-full resize-y rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-ink">聯絡方式（選填）</span>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="遊戲 ID、Discord 或 Email，方便追問"
                    className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
                  />
                </label>

                {status === 'error' ? (
                  <p className="text-sm text-rausch">提交失敗，請稍後再試。</p>
                ) : null}

                <div className="flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={!message.trim() || status === 'submitting'}
                    className="btn-primary disabled:cursor-not-allowed disabled:bg-rausch-disabled"
                  >
                    {status === 'submitting' ? '提交中…' : '送出'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
