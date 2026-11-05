import Link from 'next/link'

export function WuxiaFooter() {
  return <footer className="wuxia-footer"><div className="wuxia-frame">
    <div className="wuxia-footer-top"><Link className="wuxia-footer-name" href="/">人在江湖資料庫</Link><nav aria-label="頁尾常用連結"><Link href="/skills/compare">武技比較</Link><Link href="/tools/stats">屬性計算</Link><Link href="/forum">江湖討論</Link><Link href="/account">會員設定</Link></nav></div>
    <div className="wuxia-footer-bottom"><p>非官方玩家資料庫。未確認數據留白，實際規則以官方及遊戲內為準。</p><a href="https://eokatok.mystrikingly.com/" target="_blank" rel="noreferrer">寒江湖官方網站 ↗</a></div>
    <details className="wuxia-credits"><summary>插畫與字體來源</summary><p>首頁四幅水墨插畫為 JHDB 以 AI 輔助製作，並非遊戲畫面。</p><p>標題採用 <a href="https://github.com/google/fonts/tree/main/ofl/yujiboku" target="_blank" rel="noreferrer">Yuji Boku</a> 字體子集，© 2021 The Yuji Project Authors，<a href="/fonts/Yuji-Boku-OFL.txt">SIL Open Font License 1.1</a>。功能文字沿用 Noto Sans TC。</p></details>
    <p className="wuxia-copyright">© 2026 JHDB · 人在江湖資料庫</p>
  </div></footer>
}
