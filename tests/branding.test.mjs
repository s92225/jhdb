import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('the formal site name remains 人在江湖資料庫', () => {
  const home = readFileSync(new URL('../app/LandingPage.tsx', import.meta.url), 'utf8')
  const title = home.match(/<h1 id="home-title">([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]*>/g, '')
  assert.equal(title, '人在江湖資料庫')
  for (const [path, expected] of [
    ['../app/layout.tsx', "default: '人在江湖資料庫 · JHDB'"],
    ['../lib/auth.ts', "appName: '人在江湖資料庫'"],
    ['../app/forum/ForumUI.tsx', 'href="/forum">人在江湖資料庫</Link>'],
  ]) assert.ok(readFileSync(new URL(path, import.meta.url), 'utf8').includes(expected), path)
})
