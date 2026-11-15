'use client'

import { Fragment, useId, useState } from 'react'
import { Check, Copy, WrapText } from 'lucide-react'

const keywords = new Set(
  'call set if then else elseif end endscript function exit for to next and or not dim sub do loop while wend'.split(' '),
)
const tokenPattern = /"(?:[^"]|"")*"|'[^\r\n]*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b/g

function highlight(line: string) {
  const parts = []
  let offset = 0

  for (const match of line.matchAll(tokenPattern)) {
    const value = match[0]
    const index = match.index!
    const tone = value.startsWith('"') ? 'string'
      : value.startsWith("'") ? 'comment'
      : /^\d/.test(value) ? 'number'
      : keywords.has(value.toLowerCase()) ? 'keyword'
      : /^\s*\(/.test(line.slice(index + value.length)) ? 'call'
      : null

    parts.push(line.slice(offset, index))
    parts.push(tone ? <span className={`ocr-token-${tone}`} key={index}>{value}</span> : value)
    offset = index + value.length
  }

  parts.push(line.slice(offset))
  return parts
}

export function CodePanel({ source, title, mode = 'script' }: {
  source: string
  title: string
  mode?: 'script' | 'text' | 'log'
}) {
  const id = useId()
  const [wrap, setWrap] = useState(true)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'done' | 'failed'>('idle')
  const lines = source.split('\n')
  const language = mode === 'script' ? '按鍵精靈' : mode === 'log' ? '輸出範例' : '純文字'

  async function copy() {
    try {
      await navigator.clipboard.writeText(source)
      setCopyStatus('done')
    } catch {
      setCopyStatus('failed')
    }
  }

  return (
    <figure className="ocr-code-panel" data-wrap={wrap} aria-labelledby={id}>
      <figcaption className="ocr-code-toolbar">
        <span className="ocr-code-caption" id={id}>
          <span className="ocr-code-prompt" aria-hidden="true">{mode === 'log' ? '>_' : '</>'}</span>
          <span>{title}</span>
          <span className="ocr-code-language">{language}</span>
        </span>
        <div className="ocr-code-actions">
          <button type="button" aria-pressed={wrap} onClick={() => setWrap((enabled) => !enabled)}>
            <WrapText aria-hidden="true" size={16} />
            <span>自動換行</span>
          </button>
          <button type="button" onClick={copy}>
            {copyStatus === 'done' ? <Check aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />}
            <span>{copyStatus === 'done' ? '已複製' : '複製'}</span>
          </button>
          <span className="sr-only" role="status">{copyStatus === 'done' ? '已複製到剪貼簿' : ''}</span>
        </div>
      </figcaption>
      {copyStatus === 'failed' && <p className="ocr-copy-error" role="status">未能自動複製，請手動選取文字再複製。</p>}
      <pre tabIndex={0} aria-labelledby={id} className="ocr-code-scroll"><code>{lines.map((line, index) => (
        <Fragment key={index}>
          {index > 0 && '\n'}
          <span className="ocr-code-line">
            <span className="ocr-code-number" data-line={index + 1} aria-hidden="true" />
            <span className="ocr-code-text">{mode === 'script' ? highlight(line) : line}</span>
          </span>
        </Fragment>
      ))}</code></pre>
    </figure>
  )
}
