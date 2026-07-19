import { NextResponse } from 'next/server'

export const runtime = 'edge'

type FeedbackBody = {
  botField?: string
  page?: string
  url?: string
  contact?: string
  message?: string
}

function clip(value: string, max: number) {
  const v = value.trim()
  return v.length > max ? `${v.slice(0, max)}…` : v
}

export async function POST(request: Request) {
  let body: FeedbackBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  // Honeypot: silently accept bots without forwarding.
  if (body.botField && body.botField.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const message = clip(body.message || '', 2000)
  if (!message) {
    return NextResponse.json({ error: 'empty_message' }, { status: 400 })
  }

  const page = clip(body.page || '', 200)
  const url = clip(body.url || '', 500)
  const contact = clip(body.contact || '', 200)

  const lines = [
    '📝 數據修正提交',
    page ? `頁面：${page}` : null,
    url ? `連結：${url}` : null,
    contact ? `聯絡：${contact}` : null,
    '',
    message,
  ].filter((l) => l !== null)
  const text = lines.join('\n')

  const discordUrl = process.env.DISCORD_WEBHOOK_URL
  const tgToken = process.env.TELEGRAM_BOT_TOKEN
  const tgChatId = process.env.TELEGRAM_CHAT_ID
  const tgThreadId = process.env.TELEGRAM_MESSAGE_THREAD_ID

  const tasks: Promise<Response>[] = []

  if (discordUrl) {
    tasks.push(
      fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.slice(0, 2000) }),
      }),
    )
  }

  if (tgToken && tgChatId) {
    const payload: Record<string, unknown> = {
      chat_id: tgChatId,
      text,
      disable_web_page_preview: true,
    }
    if (tgThreadId) {
      payload.message_thread_id = Number(tgThreadId)
    }
    tasks.push(
      fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    )
  }

  if (tasks.length === 0) {
    return NextResponse.json({ error: 'no_destination_configured' }, { status: 500 })
  }

  try {
    const results = await Promise.all(tasks)
    const allOk = results.every((r) => r.ok)
    if (!allOk) {
      return NextResponse.json({ error: 'delivery_failed' }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'delivery_error' }, { status: 502 })
  }
}
