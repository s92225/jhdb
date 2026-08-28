import assert from 'node:assert/strict'
import { calculateVitalStats } from '../app/tools/stats/formulas'

const sharedCharacter = {
  age: 202,
  intellect: 265,
  strength: 350,
  currentMaxNeili: 7006,
  currentMaxJingli: 644,
  taoismOrBuddhism: 1099,
  extraMaxQi: 41364,
  extraMaxJing: 1275,
}

const latestScreenshot = calculateVitalStats({
  ...sharedCharacter,
  constitution: 250,
})

assert.equal(latestScreenshot.baseQi, 18725)
assert.equal(latestScreenshot.baseJing, 8774)
assert.equal(latestScreenshot.maxQi, 60089)
assert.equal(latestScreenshot.maxJing, 10049)

const firstScreenshot = calculateVitalStats({
  ...sharedCharacter,
  constitution: 350,
})

assert.equal(firstScreenshot.maxQi, 60889)
assert.equal(firstScreenshot.maxJing, 10049)
assert.equal(firstScreenshot.maxQi - latestScreenshot.maxQi, 800)

console.log('Stats formula tests passed:')
console.log(`- Screenshot 1: 最大氣 ${firstScreenshot.maxQi.toLocaleString()}, 最大精 ${firstScreenshot.maxJing.toLocaleString()}`)
console.log(`- Screenshot 2: 最大氣 ${latestScreenshot.maxQi.toLocaleString()}, 最大精 ${latestScreenshot.maxJing.toLocaleString()}`)
console.log('- 基本內功 900: 內力理論上限 9,000、精力理論上限 2,700')
