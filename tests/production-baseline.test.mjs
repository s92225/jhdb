import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const baseline = JSON.parse(readFileSync(new URL('./fixtures/production-calculator.json', import.meta.url), 'utf8'))

test('calculator content and formulas remain byte-identical to the approved production snapshot', () => {
  assert.deepEqual(baseline.files.map(file => file.path).sort(), [
    'app/tools/stats/StatsCalculator.tsx',
    'app/tools/stats/formulas.ts',
    'app/tools/stats/page.tsx',
  ])
  for (const file of baseline.files) {
    const bytes = readFileSync(new URL(`../${file.path}`, import.meta.url))
    const hash = createHash('sha256').update(bytes).digest('hex')
    assert.equal(hash, file.sha256, `${file.path}: calculator changes need explicit approval; do not refresh this fixture during routine syncs`)
  }
})
