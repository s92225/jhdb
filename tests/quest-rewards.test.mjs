import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const quests = JSON.parse(
  await readFile(new URL('../data/quests_integrated.json', import.meta.url), 'utf8'),
).quests

const rewardsFor = (name) => quests.find((quest) => quest.name === name)?.rewards

test('門派獨家任務 rewards match the confirmed values', () => {
  assert.deepEqual(rewardsFor('門派獨家任務 - 江湖仇殺')?.[0], { text: '3 黃金' })
  assert.deepEqual(rewardsFor('門派獨家任務 - 清剿叛徒')?.[0], { text: '500 白銀' })
})
