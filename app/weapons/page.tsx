'use client'

import { useState } from 'react'

// ---------------------------------------------------------------------------
// Weapon Data
// ---------------------------------------------------------------------------
type Weapon = {
  name: string
  attack: number
  defense: number
  total: number
  forgeable: boolean
  upgradedName?: string
  upgradedAttack?: number
  upgradedDefense?: number
  source: string
}

type WeaponCategory = {
  type: string
  forgingMaterial: string
  weapons: Weapon[]
}

const DIVINE_WEAPONS: WeaponCategory[] = [
  {
    type: '劍類',
    forgingMaterial: '隕星鐵石',
    weapons: [
      { name: '干將劍', attack: 240, defense: 10, total: 250, forgeable: false, source: '神州 - 韋小寶' },
      { name: '玄鐵神劍', attack: 180, defense: 20, total: 200, forgeable: true, upgradedName: '真·玄鐵神劍', upgradedAttack: 350, upgradedDefense: 0, source: '神州 - 韋小寶' },
      { name: '莫邪劍', attack: 245, defense: 5, total: 250, forgeable: false, source: '神州 - 韋小寶' },
      { name: '倚天劍', attack: 200, defense: 0, total: 200, forgeable: true, upgradedName: '真·倚天劍', upgradedAttack: 330, upgradedDefense: 20, source: '神州 - 韋小寶' },
      { name: '魚腸劍', attack: 250, defense: 0, total: 250, forgeable: false, source: '神州 - 韋小寶' },
      { name: '越王勾踐劍', attack: 235, defense: 15, total: 250, forgeable: false, source: '神州 - 韋小寶' },
      { name: '湛盧劍', attack: 240, defense: 10, total: 250, forgeable: false, source: '神州 - 韋小寶' },
      { name: '真武劍', attack: 200, defense: 50, total: 250, forgeable: false, source: '神州 - 韋小寶' },
      { name: '鎮岳尚方', attack: 230, defense: 20, total: 250, forgeable: false, source: '神州 - 韋小寶' },
    ],
  },
  {
    type: '刀類',
    forgingMaterial: '海底金母',
    weapons: [
      { name: '闖王寶刀', attack: 245, defense: 5, total: 250, forgeable: false, source: '神州 - 韋小寶' },
      { name: '屠龍刀', attack: 170, defense: 30, total: 200, forgeable: true, upgradedName: '真·屠龍刀', upgradedAttack: 340, upgradedDefense: 10, source: '神州 - 韋小寶' },
      { name: '伏魔刀', attack: 200, defense: 0, total: 200, forgeable: true, upgradedName: '真·伏魔刀', upgradedAttack: 350, upgradedDefense: 0, source: '神州 - 韋小寶' },
      { name: '古錠刀', attack: 250, defense: 0, total: 250, forgeable: false, source: '神州 - 韋小寶' },
      { name: '冷月寶刀', attack: 215, defense: 35, total: 250, forgeable: false, source: '神州 - 韋小寶' },
    ],
  },
  {
    type: '棍棒類',
    forgingMaterial: '千年神木',
    weapons: [
      { name: '打狗棒', attack: 150, defense: 50, total: 200, forgeable: true, upgradedName: '真·打狗棒', upgradedAttack: 345, upgradedDefense: 5, source: '神州 - 韋小寶' },
      { name: '金烏杖', attack: 250, defense: 0, total: 250, forgeable: false, source: '神州 - 韋小寶' },
    ],
  },
  {
    type: '短兵類',
    forgingMaterial: '寒絲羽竹',
    weapons: [
      { name: '百轉千形扇', attack: 200, defense: 50, total: 250, forgeable: false, source: '神州 - 韋小寶' },
      { name: '金龍鞭', attack: 210, defense: 40, total: 250, forgeable: false, source: '神州 - 韋小寶' },
      { name: '金輪', attack: 185, defense: 15, total: 200, forgeable: true, upgradedName: '真·金輪', upgradedAttack: 350, upgradedDefense: 0, source: '神州 - 韋小寶' },
      { name: '銀輪', attack: 250, defense: 0, total: 250, forgeable: false, source: '神州 - 韋小寶' },
    ],
  },
]

type OtherWeapon = {
  name: string
  attack: number | null
  defense: number | null
  source: string
  notes?: string
}

const OTHER_WEAPONS: OtherWeapon[] = [
  { name: '血刀', attack: null, defense: null, source: '血刀門副本', notes: '擊殺血刀老祖，50 碎片合成' },
  { name: '覆雨劍', attack: 300, defense: 100, source: '攔江之戰副本', notes: '擊敗龐班取得碎片合成，或擊殺浪翻雲掉落' },
  { name: '銅輪', attack: null, defense: null, source: '金輪法王任務', notes: '前往峨嵋解謎擊敗金輪法王' },
  { name: '五輪歸一', attack: null, defense: null, source: '未知', notes: '裝備時使用日月輪法有兵器加成' },
  { name: '絕情谷君子劍', attack: null, defense: null, source: '古墓副本', notes: '400級副本掉落' },
  { name: '絕情谷淑女劍', attack: null, defense: null, source: '古墓副本', notes: '400級副本掉落' },
  { name: '金鈴索', attack: null, defense: null, source: '古墓副本', notes: '400級副本掉落' },
]

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function WeaponsPage() {
  const [filter, setFilter] = useState<'all' | 'forgeable' | 'non-forgeable'>('all')
  const [selectedType, setSelectedType] = useState<string>('全部')

  const types = ['全部', ...DIVINE_WEAPONS.map(c => c.type)]

  const filteredCategories = DIVINE_WEAPONS.map(cat => ({
    ...cat,
    weapons: cat.weapons.filter(w => {
      if (filter === 'forgeable' && !w.forgeable) return false
      if (filter === 'non-forgeable' && w.forgeable) return false
      return true
    }),
  })).filter(cat => selectedType === '全部' || cat.type === selectedType)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-hairline bg-canvas p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">武器取得方式</h1>
        <p className="mt-2 text-sm text-muted">
          神兵系統共 20 把武器，可透過荊州歐治子任務線取得。另有副本掉落武器。
        </p>
      </div>

      {/* Divine Weapons Flow */}
      <div className="rounded-2xl border border-hairline bg-surface-soft p-6">
        <h2 className="text-lg font-semibold text-ink">神兵取得流程</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-6">
          {[
            { step: '1', text: '荊州找歐治子', sub: '詢問《神兵》' },
            { step: '2', text: '玉門擊殺楚昭王', sub: '取回人頭' },
            { step: '3', text: '回荊州找歐治子', sub: '給予人頭' },
            { step: '4', text: '洛陽找小寒', sub: '進入神州' },
            { step: '5', text: '神州找韋小寶', sub: '購買神兵' },
            { step: '6', text: '東南西北方向', sub: '打進階材料' },
          ].map((item, i) => (
            <div key={i} className="relative rounded-xl border border-hairline bg-canvas p-3 text-center">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-rausch px-2 py-0.5 text-xs font-bold text-white">
                {item.step}
              </div>
              <div className="mt-2 text-sm font-medium text-ink">{item.text}</div>
              <div className="mt-1 text-xs text-muted">{item.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-hairline bg-canvas px-4 py-3">
          <span className="text-2xl">💰</span>
          <div>
            <div className="font-semibold text-ink">每把神兵 5,000 黃金</div>
            <div className="text-sm text-muted">可鑄煉神兵需額外材料升級至真神兵</div>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-hairline bg-canvas px-4 py-3">
          <div className="font-semibold text-ink">打進階材料方位</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-soft text-xs font-bold text-muted">西北</span>
              <span className="text-bodytext">刀類材料（海底金母）</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-soft text-xs font-bold text-muted">西南</span>
              <span className="text-bodytext">劍類材料（隕星鐵石）</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-hairline bg-canvas p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-bodytext">類型：</span>
            {types.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`rounded-lg px-3 py-1.5 text-sm ${selectedType === t ? 'bg-ink text-canvas' : 'bg-surface-soft text-bodytext hover:bg-hairline'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-bodytext">鑄煉：</span>
            {[
              { key: 'all', label: '全部' },
              { key: 'forgeable', label: '可鑄煉' },
              { key: 'non-forgeable', label: '不可鑄煉' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={`rounded-lg px-3 py-1.5 text-sm ${filter === f.key ? 'bg-ink text-canvas' : 'bg-surface-soft text-bodytext hover:bg-hairline'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Divine Weapons List */}
      {filteredCategories.map(cat => (
        cat.weapons.length > 0 && (
          <div key={cat.type} className="rounded-2xl border border-hairline bg-canvas p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">{cat.type}</h2>
              <span className="rounded-full bg-surface-soft px-3 py-1 text-xs text-muted">
                鑄煉材料：{cat.forgingMaterial}
              </span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-muted">
                    <th className="pb-3 pr-4 font-semibold">名稱</th>
                    <th className="pb-3 pr-4 text-right font-semibold">攻擊力</th>
                    <th className="pb-3 pr-4 text-right font-semibold">防御力</th>
                    <th className="pb-3 pr-4 text-right font-semibold">總和</th>
                    <th className="pb-3 pr-4 font-semibold">可鑄煉</th>
                    <th className="pb-3 font-semibold">升級後</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.weapons.map((w, i) => (
                    <tr key={i} className="border-b border-hairline-soft last:border-0 hover:bg-surface-soft">
                      <td className="py-3 pr-4 font-medium text-ink">{w.name}</td>
                      <td className="py-3 pr-4 text-right font-mono text-rose-600">{w.attack}</td>
                      <td className="py-3 pr-4 text-right font-mono text-blue-600">{w.defense}</td>
                      <td className="py-3 pr-4 text-right font-mono text-bodytext">{w.total}</td>
                      <td className="py-3 pr-4">
                        {w.forgeable ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">可鑄煉</span>
                        ) : (
                          <span className="rounded-full bg-surface-soft px-2 py-0.5 text-xs font-medium text-muted">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        {w.forgeable && w.upgradedName ? (
                          <div className="text-xs">
                            <span className="font-medium text-amber-700">{w.upgradedName}</span>
                            <span className="ml-2 text-muted">
                              ({w.upgradedAttack}/{w.upgradedDefense})
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-soft">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ))}

      {/* Forging Info */}
      <div className="rounded-2xl border border-hairline bg-surface-soft p-5">
        <h3 className="text-sm font-semibold text-ink">鑄煉規則</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-canvas px-4 py-3">
            <div className="text-xs text-muted">不可鑄煉神兵</div>
            <div className="mt-1 text-sm font-medium text-ink">攻防總和 = 250</div>
          </div>
          <div className="rounded-lg bg-canvas px-4 py-3">
            <div className="text-xs text-muted">可鑄煉神兵</div>
            <div className="mt-1 text-sm font-medium text-ink">首階段 = 200 → 終階段 = 350</div>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {DIVINE_WEAPONS.map(cat => (
            <div key={cat.type} className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-sm">
              <span className="font-medium text-bodytext">{cat.type}</span>
              <span className="text-muted-soft">→</span>
              <span className="text-amber-700">{cat.forgingMaterial}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Other Weapons */}
      <div className="rounded-2xl border border-hairline bg-canvas p-6">
        <h2 className="text-lg font-semibold text-ink">其他武器</h2>
        <p className="mt-1 text-sm text-muted">副本掉落或任務取得的武器</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-muted">
                <th className="pb-3 pr-4 font-semibold">名稱</th>
                <th className="pb-3 pr-4 text-right font-semibold">攻擊力</th>
                <th className="pb-3 pr-4 text-right font-semibold">防御力</th>
                <th className="pb-3 pr-4 font-semibold">取得來源</th>
                <th className="pb-3 font-semibold">備註</th>
              </tr>
            </thead>
            <tbody>
              {OTHER_WEAPONS.map((w, i) => (
                <tr key={i} className="border-b border-hairline-soft last:border-0 hover:bg-surface-soft">
                  <td className="py-3 pr-4 font-medium text-ink">{w.name}</td>
                  <td className="py-3 pr-4 text-right font-mono text-rose-600">{w.attack ?? '?'}</td>
                  <td className="py-3 pr-4 text-right font-mono text-blue-600">{w.defense ?? '?'}</td>
                  <td className="py-3 pr-4 text-bodytext">{w.source}</td>
                  <td className="py-3 text-xs text-muted">{w.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
