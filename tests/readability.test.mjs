import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync,existsSync } from 'node:fs'

const css=readFileSync('app/readability.css','utf8')
test('stat ranges hide only native thumb and retain keyboard focus',()=>{
  assert.match(readFileSync('app/tools/stats/page.tsx','utf8'),/className="stats-page"/)
  for(const pseudo of ['webkit-slider-thumb','moz-range-thumb']) {
    assert.match(css,new RegExp(`::-${pseudo}[^}]+opacity:0`))
  }
  assert.match(css,/:focus-visible[^}]+outline:2px solid/)
  assert.doesNotMatch(css,/pointer-events:\s*none|input\[type=range\][^}]+display:\s*none/)
})
test('skills have readable CJK sizes, real medium face and named controls',()=>{
  const source=readFileSync('app/skills/table.tsx','utf8')
  assert.match(source,/htmlFor=\{searchId\}/)
  assert.match(source,/aria-pressed=\{family === v\}/)
  assert.match(source,/aria-label="武技階級"/)
  assert.match(source,/aria-label="武技排序"/)
  assert.match(css,/\.skills-page[^}]+font-synthesis:none/)
  assert.match(css,/\.skill-filter-title[^}]+font-size:16px/)
  assert.match(css,/\.skill-metric-label[^}]+font-size:14px[^}]+font-weight:400/)
  assert.ok(existsSync('public/fonts/jhdb-sans-tc-medium.woff'))
  assert.match(readFileSync('app/layout.tsx','utf8'),/jhdb-sans-tc-medium\.woff', weight: '500'/)
})
