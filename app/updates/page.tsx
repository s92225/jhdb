import Link from 'next/link'
import { getAllUpdates } from '@/lib/data'

// ──────────────────────────────────────────────────────────────────────────
// Patch-note content parser
// Splits a raw multi-line content string into a readable hierarchy:
//   main numbered items (1. 2. 3.) → "steps" with a numbered chip
//   sub-lines (- a) 一、 label：) rendered as bullets / labels under the item
//   emphasis (***…*** / ###…###), notes (※/備註/注意), game messages (『』﹝﹞)
//   get their own visual treatment.
// ──────────────────────────────────────────────────────────────────────────

type Line =
  | { kind: 'label'; text: string }
  | { kind: 'bullet'; text: string }
  | { kind: 'callout'; text: string; strong?: boolean }
  | { kind: 'note'; text: string }
  | { kind: 'msg'; text: string }
  | { kind: 'text'; text: string }

type Block = { num?: string; title: string; children: Line[] }

const CJK_NUM = '一二三四五六七八九十百'

function classifyChild(raw: string): Line {
  const line = raw.trim()

  // emphasis markers ***...*** or ###...###
  if (/^\*{2,}.*\*{2,}$/.test(line) || (line.includes('***') && line.length < 80)) {
    return { kind: 'callout', text: line.replace(/\*+/g, '').trim() }
  }
  if (/^#{2,}.*#{2,}$/.test(line) || (line.includes('###') && line.length < 80)) {
    return { kind: 'callout', text: line.replace(/#+/g, '').trim(), strong: true }
  }
  // note lines
  if (/^[※*]/.test(line) || /^(備註|注意事項|注意|提示)[：:]/.test(line)) {
    return { kind: 'note', text: line.replace(/^[※*]\s*/, '').trim() }
  }
  // game message examples
  if (/[『』﹝﹞「」]/.test(line)) {
    return { kind: 'msg', text: line }
  }
  // sub-headings: 一、 / a) / a. / label：(short, ends with colon)
  if (new RegExp(`^[${CJK_NUM}]+、`).test(line)) {
    return { kind: 'label', text: line.replace(new RegExp(`^[${CJK_NUM}]+、\\s*`), '').trim() }
  }
  if (/^[a-zA-Z][)）.、]\s*/.test(line)) {
    return { kind: 'bullet', text: line.replace(/^[a-zA-Z][)）.、]\s*/, '').trim() }
  }
  if (/^[-–—‧•·]\s*/.test(line)) {
    return { kind: 'bullet', text: line.replace(/^[-–—‧•·]\s*/, '').trim() }
  }
  // short line ending with colon → treat as a section label
  if (/[：:]$/.test(line) && line.replace(/[：:]$/, '').length <= 12) {
    return { kind: 'label', text: line }
  }
  return { kind: 'text', text: line }
}

function parseContent(content: string): Block[] {
  const lines = content
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .filter((l) => l.trim().length > 0)

  const blocks: Block[] = []
  let current: Block | null = null

  for (const raw of lines) {
    const m = raw.trim().match(/^(\d+)[.、)]\s*(.*)$/)
    if (m) {
      // start a new main item
      if (current) blocks.push(current)
      current = { num: m[1], title: m[2].trim(), children: [] }
      continue
    }
    if (!current) {
      // content with no leading number → implicit single block
      current = { title: '', children: [] }
    }
    current.children.push(classifyChild(raw))
  }
  if (current) blocks.push(current)
  return blocks
}

function Children({ items }: { items: Line[] }) {
  if (!items.length) return null
  return (
    <div className="mt-2 space-y-1.5">
      {items.map((it, i) => {
        switch (it.kind) {
          case 'label':
            return (
              <div key={i} className="pt-1 text-[13px] font-semibold text-ink">
                {it.text}
              </div>
            )
          case 'bullet':
            return (
              <div key={i} className="flex gap-2 text-[14px] leading-relaxed text-bodytext">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-muted-soft" />
                <span>{it.text}</span>
              </div>
            )
          case 'callout':
            return (
              <div
                key={i}
                className={[
                  'rounded-lg px-3 py-2 text-[13px] font-medium',
                  it.strong
                    ? 'bg-rausch/10 text-rausch'
                    : 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
                ].join(' ')}
              >
                {it.text}
              </div>
            )
          case 'note':
            return (
              <div
                key={i}
                className="rounded-lg bg-surface-soft px-3 py-2 text-[13px] text-muted"
              >
                <span className="mr-1 font-semibold text-ink">※</span>
                {it.text}
              </div>
            )
          case 'msg':
            return (
              <div
                key={i}
                className="border-l-2 border-hairline bg-surface-soft px-3 py-1.5 text-[13px] italic text-muted"
              >
                {it.text}
              </div>
            )
          default:
            return (
              <p key={i} className="text-[14px] leading-relaxed text-bodytext">
                {it.text}
              </p>
            )
        }
      })}
    </div>
  )
}

export default function UpdatesPage() {
  const updates = getAllUpdates()

  return (
    <div className="space-y-8">
      <div>
        <Link className="text-sm font-medium text-muted hover:text-ink" href="/">
          ← 返回首頁
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">近期更新</h1>
        <p className="mt-2 text-base text-muted">
          依時間排序的遊戲更新摘要，共 {updates.length} 則。
        </p>
      </div>

      {updates.length > 0 ? (
        <div className="space-y-4">
          {updates.map((u, i) => {
            const blocks = parseContent(String(u.content || ''))
            const src = String(u.sourceFile || '')
            return (
              <article
                key={u.id}
                className="rounded-2xl border border-hairline bg-canvas p-6 transition-shadow hover:shadow-airbnb sm:p-8"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <time className="text-sm font-semibold text-ink">
                    {u.date || u.title || '—'}
                  </time>
                  {i === 0 && (
                    <span className="rounded-full bg-rausch px-2.5 py-0.5 text-xs font-semibold text-white">
                      最新
                    </span>
                  )}
                  {src && src !== 'manual' ? (
                    <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[11px] font-medium text-muted">
                      {src}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 space-y-4">
                  {blocks.map((b, bi) => (
                    <div key={bi} className="flex gap-3">
                      {b.num ? (
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                          {b.num}
                        </span>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        {b.title ? (
                          <p className="text-[15px] font-semibold leading-relaxed text-ink">
                            {b.title}
                          </p>
                        ) : null}
                        <Children items={b.children} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-hairline bg-canvas p-6 text-sm text-muted">
          尚無更新資料
        </div>
      )}
    </div>
  )
}
