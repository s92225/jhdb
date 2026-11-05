import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { HERO_MOTION_LIMITS, heroCoverCrop, heroRenderSize, isHeroMotionEnabled } from '../lib/hero-motion-settings'

test('approved motion is on by default and supports a static URL opt-out', () => {
  assert.equal(isHeroMotionEnabled(''), true)
  assert.equal(isHeroMotionEnabled('?motion=1'), true)
  assert.equal(isHeroMotionEnabled('?q=九陰白骨爪'), true)
  assert.equal(isHeroMotionEnabled('?motion=0'), false)
  assert.equal(isHeroMotionEnabled('?q=test&motion=0'), false)
})
test('cover geometry preserves the original desktop and mobile composition', () => {
  assert.deepEqual(heroCoverCrop(1774, 887, false), [0, 0, 1, 1])
  const desktop = heroCoverCrop(1440, 780, false)
  assert.equal(desktop[1], 0)
  assert.ok(Math.abs(desktop[0] - (1 - desktop[2]) * 0.68) < 1e-9)
  const mobile = heroCoverCrop(390, 264, true)
  assert.ok(Math.abs(mobile[0] - (1 - mobile[2]) * 0.78) < 1e-9)
})
test('render target is bounded even at 4K and high device pixel ratios', () => {
  for (const [w,h,dpr] of [[390,264,3],[1440,780,2],[3840,2160,3],[1,1,1]]) {
    const [rw,rh] = heroRenderSize(w,h,dpr)
    assert.ok(rw * rh <= HERO_MOTION_LIMITS.maxPixels)
    assert.ok(rw <= HERO_MOTION_LIMITS.maxWidth)
    assert.ok(rw > 0 && rh > 0)
  }
})
test('motion honours reduced motion, exposes a pause control and keeps the original', () => {
  const component = readFileSync('app/components/HeroMotionPreview.tsx', 'utf8')
  const renderer = readFileSync('lib/hero-motion.ts', 'utf8')
  assert.match(component, /prefers-reduced-motion: reduce/)
  assert.match(component, /aria-pressed=\{!paused\}/)
  assert.match(component, /此裝置顯示原圖/)
  assert.match(renderer, /visibilitychange/)
  assert.match(renderer, /IntersectionObserver/)
  assert.match(renderer, /deleteTexture/)
  assert.match(renderer, /cancelAnimationFrame/)
  assert.match(readFileSync('app/LandingPage.tsx', 'utf8'), /<HeroMotionPreview \/>/)
  assert.ok(statSync('public/art/wuxia/hero-cleanplate-preview.webp').size < 350_000)
})
