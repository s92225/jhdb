import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('character stats calculator is publicly discoverable and accessible', async () => {
  const [hubTabs, footer, toolsPage, statsPage, updates] = await Promise.all([
    read('app/components/HubTabs.tsx'),
    read('app/components/SiteFooter.tsx'),
    read('app/tools/page.tsx'),
    read('app/tools/stats/page.tsx'),
    read('data/updates.json'),
  ])

  assert.match(hubTabs, /href:\s*['"]\/tools\/stats['"]/)
  assert.match(footer, /href:\s*['"]\/tools\/stats['"]/)
  assert.match(toolsPage, /href:\s*['"]\/tools\/stats['"]/)
  assert.match(statsPage, /<StatsCalculator\s*\/>/)
  assert.doesNotMatch(statsPage, /notFound\s*\(/)
  assert.match(updates, /人物屬性計算器/)
})
