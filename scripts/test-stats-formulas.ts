import assert from 'node:assert/strict'
import { calculateKnowledgeBonus, calculateVitalStats } from '../app/tools/stats/formulas'

const character = {
  intellect: 30,
  strength: 30,
  constitution: 30,
  currentMaxNeili: 500,
  currentMaxJingli: 300,
  taoismOrBuddhism: 0,
}

const atAge = (age: number) => calculateVitalStats({ ...character, age })

// Explicit expectations, independent of the implementation's cap constant.
// Older screenshot fixtures used calibrated permanent bonuses and cannot
// independently validate the corrected age cap.
const expectedByAge = [
  { age: 13, qiGrowth: 0, jingGrowth: 0, maxQi: 766, maxJing: 300 },
  { age: 14, qiGrowth: 0, jingGrowth: 0, maxQi: 766, maxJing: 300 },
  { age: 20, qiGrowth: 240, jingGrowth: 120, maxQi: 1006, maxJing: 420 },
  { age: 24, qiGrowth: 400, jingGrowth: 200, maxQi: 1166, maxJing: 500 },
  { age: 25, qiGrowth: 440, jingGrowth: 220, maxQi: 1206, maxJing: 520 },
  { age: 26, qiGrowth: 440, jingGrowth: 220, maxQi: 1206, maxJing: 520 },
  { age: 123, qiGrowth: 440, jingGrowth: 220, maxQi: 1206, maxJing: 520 },
  { age: 202, qiGrowth: 440, jingGrowth: 220, maxQi: 1206, maxJing: 520 },
  { age: 1000, qiGrowth: 440, jingGrowth: 220, maxQi: 1206, maxJing: 520 },
]

for (const expected of expectedByAge) {
  const actual = atAge(expected.age)
  assert.equal(actual.qiAgeGrowth, expected.qiGrowth, `age ${expected.age}: qi growth`)
  assert.equal(actual.jingAgeGrowth, expected.jingGrowth, `age ${expected.age}: jing growth`)
  assert.equal(actual.maxQi, expected.maxQi, `age ${expected.age}: max qi`)
  assert.equal(actual.maxJing, expected.maxJing, `age ${expected.age}: max jing`)
}

assert.deepEqual(atAge(123), atAge(25))
assert.ok(atAge(25).maxQi > atAge(24).maxQi)
assert.ok(atAge(25).maxJing > atAge(24).maxJing)

// The age correction does not change knowledge, trained-resource or permanent bonuses.
assert.deepEqual(calculateKnowledgeBonus(30), { qi: 0, jing: 0 })
assert.deepEqual(calculateKnowledgeBonus(60), { qi: 360, jing: 240 })
assert.deepEqual(calculateKnowledgeBonus(61), { qi: 610, jing: 366 })
const withBonuses = calculateVitalStats({
  ...character,
  age: 123,
  taoismOrBuddhism: 61,
  extraMaxQi: 50,
  extraMaxJing: 25,
})
assert.equal(withBonuses.baseQi, 1816)
assert.equal(withBonuses.baseJing, 886)
assert.equal(withBonuses.maxQi, 1866)
assert.equal(withBonuses.maxJing, 911)

// Fractional growth is truncated, not rounded.
const fractional = calculateVitalStats({ ...character, age: 25, strength: 31, intellect: 31 })
assert.equal(fractional.qiAgeGrowth, 447)
assert.equal(fractional.jingAgeGrowth, 227)

console.log('Stats formula tests passed:')
console.log('- 氣、精年齡成長均於 25 歲封頂；24 歲仍未封頂')
console.log('- 25、26、123、202、1000 歲計算結果一致')
console.log('- 心法、已修練內力／精力、永久加成及取整測試通過')
