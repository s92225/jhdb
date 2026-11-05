import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { getAllQuests, getAllDungeons, getStats } from '../lib/data'
import { visibleQuestEntries } from '../lib/guide-catalog'
import { DAMO_CELLS, DAMO_LAYOUT, DAMO_ROUTE, damoCellTone } from '../lib/damo-maze'

const list=visibleQuestEntries(getAllQuests())
assert.equal(list.length,14)
assert.equal(getStats().quests,list.length,'home and guide task counts must agree')
const dungeons=JSON.parse(readFileSync('data/dungeons_integrated.json','utf8')).dungeons
assert.equal(getStats().dungeons,dungeons.length)
assert.deepEqual(getAllDungeons().map((d)=>d.id),dungeons.map((d:{id:string})=>d.id))
assert.ok(!list.some((q)=>q.id==='quest-神兵取得流程'))
assert.deepEqual(visibleQuestEntries([{id:'a'},{id:'quest-神兵取得流程'},{id:'b',weapons:{}}]),[{id:'a'}])
const home=readFileSync('app/LandingPage.tsx','utf8')
assert.doesNotMatch(home,/home-momentum|<MomentumExplorer/)
assert.match(home,/art\/wuxia\/hero\.webp/)
assert.match(readFileSync('app/systems/momentum/page.tsx','utf8'),/MomentumExplorer/)
for(const file of ['quests','dungeons','masters','attributes']) {
  const source=readFileSync(`app/guides/${file}/page.tsx`,'utf8')
  assert.match(source,/<GuideHeader/)
  assert.doesNotMatch(source,/(?:bg|text|ring|border)-(?:indigo|purple|rose|amber|blue)-\d/)
}
const categories=readFileSync('app/components/CategoryTabs.tsx','utf8')
assert.match(categories,/aria-pressed=\{isActive\}/)
assert.match(categories,/htmlFor=\{searchId\}/)
assert.match(categories,/setActive\(ALL\);setQ\(''\)/)
console.log('Guide catalogue counts, preserved momentum route, replacement artwork and shared guide style: passed')

// A colour-only revision must not change the maze's actual teleport rules.
assert.deepEqual(DAMO_CELLS.map(({id,T,R,B,L})=>[id,T,R,B,L]),[
  [1,'2','出口','7','8'],[4,'3','5','7','7'],[7,'4','1','3','6'],[10,'9','3','—','9'],
  [2,'10','3','1','9'],[5,'1','6','7','4'],[8,'9','1','1','8'],[3,'10','2','4','9'],
  [6,'7','1','6','6'],[9,'10','2','8','10'],
])
assert.deepEqual(DAMO_CELLS.map(c=>DAMO_LAYOUT[c.id]),[[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]])
assert.deepEqual(DAMO_ROUTE.map(s=>[s.dir,s.from,s.to]),[['上',1,2],['右',2,3],['下',3,4],['右',4,5]])
for(const step of DAMO_ROUTE) assert.equal(DAMO_CELLS.find(c=>c.id===step.from)?.[step.direction],String(step.to))
assert.equal(damoCellTone(1),'start')
assert.equal(damoCellTone(5),'target')
for(const id of [2,3,4]) assert.equal(damoCellTone(id),'route')
for(const id of [6,7,8,9,10]) assert.equal(damoCellTone(id),undefined)
const maze=readFileSync('app/components/DamoMaze.tsx','utf8')
for(const tone of ['start','route','target','exit']) assert.match(maze,new RegExp(`tone="${tone}"`))
assert.match(maze,/data-maze-tone=\{tone\}/)
assert.match(maze,/aria-label="地圖圖例"/)
assert.match(maze,/label = tone === 'start' \? '入口'/)
const globals=readFileSync('app/globals.css','utf8')
function luminance(hex:string) {
  const rgb=hex.match(/[a-f\d]{2}/gi)!.map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4)
  return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]
}
function contrast(a:string,b:string) { const x=luminance(a),y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05) }
function signal(name:string) { return globals.match(new RegExp(`--signal-${name}:\\s*(#[a-f\\d]{6})`,'i'))![1] }
for(const tone of ['info','attention','danger','success']) {
  assert.ok(contrast(signal(`${tone}-ink`),signal(`${tone}-soft`))>=4.5,`${tone} text contrast`)
  assert.ok(contrast(signal(tone),signal(`${tone}-soft`))>=3,`${tone} map border contrast`)
}
assert.ok(contrast('#ffffff',signal('success'))>=4.5,'exit text contrast')
console.log('Maze topology, visible role labels and functional palette text / marker contrast: passed')
