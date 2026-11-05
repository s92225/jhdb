import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, statSync } from 'node:fs'

const home = readFileSync('app/LandingPage.tsx', 'utf8')
const css = readFileSync('app/wuxia-home.css', 'utf8')
test('wuxia homepage keeps search as a real accessible primary action', () => {
  assert.match(home, /role="search" aria-label="全站資料搜尋"/)
  assert.match(home, /htmlFor="home-search"/)
  assert.match(home, /id="home-search" name="q" type="search"/)
  assert.match(home, /CustomEvent\('jhdb:search'/)
  assert.match(home, /event.preventDefault\(\); openSearch\(search\)/)
  assert.match(home, /<noscript>/)
})
test('catalogue values and destinations use the real site data and existing routes', () => {
  for (const field of ['skills', 'quests', 'dungeons', 'manuals']) assert.ok(home.includes(`stats.${field}`))
  for (const href of ['/skills', '/guides/quests', '/equipment/manuals', '/tools', '/tools/dazuo', '/tools/stats', '/tools/macros', '/updates', '/forum']) assert.ok(home.includes(`href="${href}"`), href)
  assert.match(home, /updates.slice\(0, 3\)/)
  assert.doesNotMatch(home, /home-momentum|MomentumExplorer/)
})
test('original art is local, light and not borrowed from the watermarked reference', () => {
  for (const name of ['hero', 'scrolls-thumb', 'ferry-thumb', 'night-thumb']) {
    const p = `public/art/wuxia/${name}.webp`
    assert.ok(existsSync(p), p)
    assert.ok(statSync(p).size < 450000, p)
    assert.ok(home.includes(`/art/wuxia/${name}.webp`))
  }
  assert.ok(statSync('public/art/wuxia/hero.webp').size < 300000)
  assert.doesNotMatch(home, /lovepik|codex-clipboard|picsum|unsplash/i)
})
test('approved skin stays legible and honours reduced motion', () => {
  const shell = readFileSync('app/components/LayoutShell.tsx', 'utf8')
  assert.match(shell, /isLanding \? 'wuxia-home-skin'/)
  assert.match(shell, /<WuxiaFooter \/>/)
  assert.match(css, /prefers-reduced-motion: reduce/)
  assert.match(css, /font-synthesis: none/)
  assert.match(css, /\.wuxia-search input[^}]*font-size: 16px/)
  assert.match(css, /\.wuxia-site-skin :focus-visible/)
  assert.doesNotMatch(css, /linear-gradient|radial-gradient|backdrop-filter/)
  assert.ok(existsSync('public/fonts/jhdb-wuxia-display.woff'))
  assert.ok(existsSync('public/fonts/Yuji-Boku-OFL.txt'))
})
