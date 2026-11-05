import type { Metadata } from 'next'
import Link from 'next/link'
import { ReferenceHeading } from '@/app/components/ReferenceHeading'

export const metadata: Metadata = {
  title: '遊戲系統總覽｜人在江湖資料庫',
  description: '五行相生相剋、連擊進攻、組合技能、兵器加成、暗勁疊層等特殊系統說明。',
}

const SYSTEMS: Array<{
  title: string
  desc: string
  href?: string
  linkLabel?: string
}> = [
  {
    title: '氣勢系統',
    desc: '2026 年 10 月 31 日實裝。氣勢 −10 至 +10；命中率每點 ±1%。純普攻每點 ±0.5% 傷害，觸發特殊加成時改為每點 ±0.25%。每回合出手後 ×0.85 衰減，戰鬥結束、死亡、逃跑、打坐、吐納或斷線時歸零。',
    href: '/systems/momentum',
    linkLabel: '氣勢互動速查 →',
  },
  {
    title: '自習深造與實戰經驗上限',
    desc: '2026 年 9 月 2 日調整：實戰經驗上限 7.32 億（732,000,000）。八大基本武功在 2000–2800 級可免書自習，修為難度提高一倍，支援中文指令。八項名稱未在此公告列出，不額外推定。',
  },
  {
    title: '全服自動公告',
    desc: '每 60 分鐘發佈一次全服公告。已按官網核對，修正本站舊有的 15 分鐘記錄。',
  },
  {
    title: '自動復活與玩家死鬥',
    desc: '未手動復活的角色在死亡 5 分鐘後自動回門派重生點，回滿氣、精、飽足感與止渴度。對玩家發起死鬥需年齡 ≥200 歲及戰鬥經驗 ≥2000 萬；目標玩家不再受年齡與經驗限制。',
  },
  {
    title: '五行相生相剋',
    desc: '劍（金）、短兵（水）、刀（火）、棍（木）、拳腳（土）。死鬥中依雙方使用的基本技能判定：相生 +20% 傷害、相剋 −20% 傷害。',
    href: '/systems/five-elements',
    linkLabel: '互動式五行圖 →',
  },
  {
    title: '連擊進攻',
    desc: '18 種武技有機率連續出招，連擊傷害獨立計算並可再觸發暴擊。',
    href: '/skills',
    linkLabel: '查看具備連擊的武技 →',
  },
  {
    title: '組合技能',
    desc: '配置指定武技＋輕功可獲得閃避率加成。',
    href: '/skills',
    linkLabel: '查看組合技能配置 →',
  },
  {
    title: '兵器加成',
    desc: '指定兵器搭配對應武技可提升傷害（+50%~+100% 不等）。',
    href: '/equipment',
    linkLabel: '查看武器神兵 →',
  },
  {
    title: '暗勁／毒性／寒毒疊層',
    desc: '12 種武技命中時可疊加暗勁、毒性或寒毒層數，造成持續傷害。',
    href: '/skills/simulator',
    linkLabel: '用模擬器估算 DoT →',
  },
  {
    title: '左右互搏之術',
    desc: '技能等級 ≥ 100 且悟性 ≤ 100 時，攻擊命中後最終傷害 ×1.5（主攻與連擊獨立計算），作用於所有加成之後的最終環節。',
  },
  {
    title: '招架反震',
    desc: '乾坤大挪移（臂力 ×10）與斗轉星移（悟性 ×20）達 500 級並配置於基本招架時，成功招架必定反震，無視防禦。',
  },
  {
    title: '真氣護盾值系統',
    desc: '擁有「金剛不壞體神功」即自動獲得護盾，護盾值 =（技能等級 ÷ 100）× 1000，最高 20000。護盾在每場戰鬥開始時自動回滿，優先吸收傷害，歸零後才扣氣血。可向鬼市黑商購得。',
  },
  {
    title: '傳承絕學',
    desc: '裝備本門上古傳承無上神武（2000 級）搭配本門高級內功（700 級），每次攻擊 10% 機率發動傳承絕學，必中且傷害暴增 5 倍。',
    href: '/skills',
    linkLabel: '查看上古傳承無上神武 →',
  },
  {
    title: '禁令區域',
    desc: '襄陽城中心廣場及武林大會場地不得運功調息、進食飲水。部分副本地圖（如笑傲江湖）亦禁止飲食與運功。',
  },
  {
    title: '神兵暴擊',
    desc: '裝備六把上古神兵（真·倚天劍、真·打狗棒、真·伏魔刀、真·屠龍刀、真·玄鐵神劍、五輪歸一）之一時，每次攻擊命中（含連擊每招）有 50% 機率觸發神兵暴擊，該次最終傷害 +30%。',
  },
  {
    title: '套裝減傷',
    desc: '護法袈裟＋金絲手套：20% 機率減傷 20%。魔師袍服＋青銅護腕：30% 機率減傷 30%。套裝效果不可疊加，裝備損壞即失效。',
  },
  {
    title: '忙碌狀態',
    desc: '苗家劍法、彈指神通、冰蠶毒掌、火焰刀命中時有 10% 機率使目標陷入 1~3 回合忙碌狀態，已忙碌則不重複觸發。',
    href: '/skills',
    linkLabel: '查看具備忙碌狀態的武技 →',
  },
  {
    title: '死亡懲罰',
    desc: '玩家死亡時損失 3% 經驗值。',
  },
  {
    title: '門派功勳兌換',
    desc: '專屬門派裝備：100 功勳／件。專屬限定防具：300 功勳／件。100 功勳 → 20 黃金（GM）。1000 功勳 → 10000 潛能（GM）。3000 功勳 → 5000000 經驗（GM）。',
  },
  {
    title: '擊殺掉落',
    desc: '擊殺任何生物後，有 10% 機率獨立獲得「九轉熊蛇丸」和「丹劫」。',
  },
]

export default function SystemsPage() {
  return (
    <div className="space-y-10">
      <ReferenceHeading title="遊戲系統總覽" description={<p>
          寒江湖的特殊戰鬥系統一覽。各系統的詳細數值可在
          <Link href="/skills" className="mx-1 font-medium text-rausch hover:text-rausch-active">
            武技總覽
          </Link>
          以「類型配置」篩選，或用
          <Link href="/skills/simulator" className="mx-1 font-medium text-rausch hover:text-rausch-active">
            特效模擬器
          </Link>
          實際估算。
        </p>} />

      <div className="rules-list">
        {SYSTEMS.map((s) => (
          <article key={s.title} id={s.title === '自習深造與實戰經驗上限' ? 'training' : undefined}>
            <div>
              <div className="min-w-0">
                <h2>{s.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-bodytext">{s.desc}</p>
                {s.href ? (
                  <Link
                    href={s.href}
                    className="mt-3 inline-block text-sm font-medium text-rausch hover:text-rausch-active"
                  >
                    {s.linkLabel}
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
