import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const home = readFileSync('app/LandingPage.tsx', 'utf8')
test('homepage search uses the existing indexed search dialog', () => {
  assert.match(home, /role="search" aria-label="全站資料搜尋"/)
  assert.match(home, /htmlFor="home-search"/)
  assert.match(home, /CustomEvent\('jhdb:search'/)
  assert.match(home, /event.preventDefault\(\); openSearch\(search\)/)
  assert.match(readFileSync('app/components/SearchCommand.tsx', 'utf8'), /addEventListener\('jhdb:search'/)
})
test('homepage keeps live catalogue counts and existing destinations', () => {
  for (const field of ['skills', 'quests', 'dungeons', 'manuals']) assert.ok(home.includes(`stats.${field}`))
  for (const href of ['/skills', '/guides/quests', '/equipment/manuals', '/tools/dazuo', '/tools/macros', '/updates']) assert.ok(home.includes(`href="${href}"`))
  for (const name of ['hero', 'scrolls-thumb', 'ferry-thumb', 'night-thumb']) assert.ok(existsSync(`public/art/wuxia/${name}.webp`))
  assert.doesNotMatch(home, /href="\/(?:forum|account)"/)
})
test('new home chrome is isolated; existing inner-page shell is retained', () => {
  const shell = readFileSync('app/components/LayoutShell.tsx', 'utf8')
  assert.match(shell, /if \(isLanding\)/)
  assert.match(shell, /<WuxiaHomeShell searchEntries=\{searchEntries\}>/)
  assert.match(shell, /<SiteHeader searchEntries=\{searchEntries\} \/>/)
  assert.match(shell, /<SiteFooter \/>/)
  assert.match(readFileSync('app/wuxia-home.css', 'utf8'), /prefers-reduced-motion: reduce/)
})
