import Link from 'next/link'

const LINKS = [
  { href: '/forum', label: '江湖討論' }, { href: '/account', label: '會員設定' },
  { href: '/skills/compare', label: '武技比較' }, { href: '/skills/simulator', label: '特效模擬' },
  { href: '/guides/dungeons', label: '副本攻略' }, { href: '/guides/masters', label: '師傅給物' },
  { href: '/guides/attributes', label: '屬性指南' }, { href: '/equipment/manuals', label: '秘笈線索' },
  { href: '/tools/dazuo', label: '打坐計算' }, { href: '/tools/stats', label: '屬性計算' },
  { href: '/tools/macros', label: '按精教程' }, { href: '/systems/momentum', label: '氣勢速查' },
  { href: '/systems/five-elements', label: '五行系統' }, { href: '/updates', label: '更新日誌' },
]

export function SiteFooter() {
  return <footer className="site-footer"><div className="site-frame">
    <Link className="footer-wordmark" href="/" aria-label="JHDB 首頁">JHDB.</Link>
    <div className="footer-body"><div><p className="footer-statement">江湖有路，<br />查有所本。</p><p>寒江湖 MUD 玩家整理，非官方網站。<br />資料可能有誤，請以遊戲內為準。</p></div><nav aria-label="頁尾導覽">{LINKS.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav></div>
    <details className="art-credits"><summary>畫作來源與使用授權</summary><p>以下為營造江湖意境的歷史畫作，並非遊戲畫面。The Metropolitan Museum of Art Open Access，均為 Public Domain / CC0；圖片已裁切及統一色調。</p><ul><li><a href="https://www.metmuseum.org/art/collection/search/42187">River Landscape（江山無盡圖），傳陳淳</a> — 首頁主視覺。</li><li><a href="https://www.metmuseum.org/art/collection/search/54022">Sword, Shoes and a Scroll, Representing the Chinese Warrior Chōryō，Ryūryūkyo Shinsai</a> — 武學導覽；十九世紀木版畫，Public Domain / CC0。</li><li><a href="https://www.metmuseum.org/art/collection/search/51662">River Landscape with Boatmen，佚名</a> — 更新欄。</li><li><a href="https://www.metmuseum.org/art/collection/search/45032">River Landscape，項元汴</a> — 資料原則欄。</li></ul></details>
    <div className="footer-legal"><span>© 2026 JHDB · 人在江湖資料庫</span><a href="https://eokatok.mystrikingly.com/" target="_blank" rel="noreferrer">寒江湖官方網站 ↗</a></div>
  </div></footer>
}
