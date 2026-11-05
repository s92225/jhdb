import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { momentumBonus, signedPercent, MOMENTUM_RULES } from '../lib/momentum'

for (const [points,hit,normal,special] of [[10,10,5,2],[7,7,3,1],[5,5,2,1],[3,3,1,0],[0,0,0,0],[-3,-3,-1,0],[-5,-5,-2,-1],[-10,-10,-5,-2]]) {
  const bonus = momentumBonus(points)
  assert.equal(bonus.hit, hit)
  assert.equal(Math.trunc(bonus.normal) || 0, normal)
  assert.equal(Math.trunc(bonus.special) || 0, special)
}
assert.equal(momentumBonus(100).points,10)
assert.equal(momentumBonus(-100).points,-10)
assert.equal(momentumBonus(Number.NaN).points,0)
assert.equal(momentumBonus(5).normal,2.5)
assert.equal(momentumBonus(5).special,1.25)
assert.equal(signedPercent(-0.75,true),'0%')
assert.equal(signedPercent(2.5,true),'+2%')
assert.equal(MOMENTUM_RULES.decay,0.85)
assert.equal(MOMENTUM_RULES.events.find((e) => e.name === '遭招架反傷')?.attacker,-4)
assert.deepEqual(MOMENTUM_RULES.reset,['戰鬥結束','死亡','逃跑','打坐','吐納','斷線'])

type Note = { id: string; date: string; content: string; sourceUrl?: string; verifiedAt?: string }
const updates: Note[] = JSON.parse(readFileSync(new URL('../data/updates.json',import.meta.url),'utf8'))
assert.equal(new Set(updates.map((u) => u.id)).size,updates.length)
assert.equal(updates[0].date,'31 Oct 2026')
const sept = updates.find((u) => u.id === 'update-official-02-sep-2026')!
assert.match(sept.content,/732,000,000/)
assert.match(sept.content,/2000–2800/)
assert.match(updates.find((u) => u.id === 'update-manual-15-jun-2026-0')!.content,/60 分鐘/)
assert.match(updates.find((u) => u.id === 'update-official-31-mar-2026')!.content,/火焰刀＋草上飛/)
assert.match(updates.find((u) => u.id === 'update-official-22-feb-2026')!.content,/5 分鐘/)
for (const u of updates.filter((u) => u.id.startsWith('update-official-'))) {
  assert.equal(u.sourceUrl,'https://eokatok.mystrikingly.com/')
  assert.equal(u.verifiedAt,'2026-10-31')
}
console.log('Official-rule tests passed: quick-reference values, caps, rounding, provenance and latest updates.')
