import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowUpRight, ChevronDown, Download } from 'lucide-react'
import { CodePanel } from './CodePanel'
import './ocr-docs.css'

export const metadata: Metadata = {
  title: 'DaZuo OCR 安裝教程｜按精教程',
  description: '按鍵精靈 + 大漠 Plugin + 打坐 OCR Script 完整安裝教程。',
}

const STEPS = [
  { id: 'downloads', label: '下載檔案' },
  { id: 'display', label: 'XP 顯示設定' },
  { id: 'anjing', label: '安裝按精' },
  { id: 'dm-plugin', label: '大漠 Plugin' },
  { id: 'test-dm', label: '測試大漠' },
  { id: 'dict', label: 'OCR 字庫' },
  { id: 'test-ocr', label: '測試 OCR' },
  { id: 'install-script', label: '安裝 Script' },
  { id: 'run', label: '正式運行' },
  { id: 'logs', label: '調試訊息' },
  { id: 'troubleshoot', label: '常見處理' },
  { id: 'backup', label: '備份' },
]

const DOWNLOADS = {
  plugin: 'dm-regdll-plugin.zip',
  dictionary: 'mud_num.txt',
  script: 'dazuo-ocr-script.txt',
} as const

const TEST_DM_CODE = `Call Plugin.RegDll.Reg("C:\\dm\\dm.dll")

Set dm = CreateObject("dm.dmsoft")
dm.SetPath "C:\\dm"

TracePrint "大漠版本: " & dm.Ver()`

const TEST_OCR_CODE = `Call Plugin.RegDll.Reg("C:\\dm\\dm.dll")

Set dm = CreateObject("dm.dmsoft")
dm.SetPath "C:\\dm"

TracePrint "大漠版本: " & dm.Ver()

retDict = dm.SetDict(0, "mud_num.txt")
dm.UseDict 0

TracePrint "SetDict ret: " & retDict

If retDict <> 1 Then
    TracePrint "字庫載入失敗，請確認 C:\\dm\\mud_num.txt 是否存在。"
    EndScript
End If

Function OnlyDigits(s)
    result = ""
    For i = 1 To Len(s)
        ch = Mid(s, i, 1)
        If ch >= "0" And ch <= "9" Then
            result = result & ch
        End If
    Next
    OnlyDigits = result
End Function

Function OCRToNumber(s)
    cleanText = OnlyDigits(s)
    If cleanText = "" Then
        OCRToNumber = -1
    ElseIf IsNumeric(cleanText) Then
        OCRToNumber = CLng(cleanText)
    Else
        OCRToNumber = -1
    End If
End Function

Function OcrWithFallback(x1, y1, x2, y2, normalColor, redColor, simValue)
    normalText = dm.Ocr(x1, y1, x2, y2, normalColor, simValue)
    normalNum = OCRToNumber(normalText)
    If normalNum >= 0 Then
        OcrWithFallback = normalText
        Exit Function
    End If
    TracePrint "正常色 OCR 失敗，嘗試紅色 OCR。"
    redText = dm.Ocr(x1, y1, x2, y2, redColor, simValue)
    OcrWithFallback = redText
End Function

MsgBox "請將滑鼠移到 X-MudClient 遊戲視窗入面，然後按確定。"

hwnd = dm.GetMousePointWindow()

If hwnd = 0 Then
    TracePrint "無法取得 X-MudClient 視窗。"
    EndScript
End If

ret = dm.GetWindowRect(hwnd, winX1, winY1, winX2, winY2)

normalNeiLiColor = "5ac7ff-303030|45c7ff-303030|40cfff-303030"
normalQiColor = "00ff00-303030|63ef63-303030|40ff40-303030|00cc00-303030"
redNumColor = "ff0000-303030|ff3333-303030|ff5555-303030|cc0000-303030"
ocrSimilarity = 0.90

rawNeiLiCurrent = OcrWithFallback(winX1 + 28, winY1 + 111, winX1 + 66,  winY1 + 132, normalNeiLiColor, redNumColor, ocrSimilarity)
rawNeiLiMax = OcrWithFallback(winX1 + 68, winY1 + 111, winX1 + 120, winY1 + 132, normalNeiLiColor, redNumColor, ocrSimilarity)
rawQiCurrent = OcrWithFallback(winX1 + 25, winY1 + 146, winX1 + 66,  winY1 + 168, normalQiColor, redNumColor, ocrSimilarity)
rawQiMax = OcrWithFallback(winX1 + 68, winY1 + 146, winX1 + 126, winY1 + 168, normalQiColor, redNumColor, ocrSimilarity)

TracePrint "OCR raw 目前內力: " & rawNeiLiCurrent
TracePrint "OCR raw Max 內力: " & rawNeiLiMax
TracePrint "OCR raw 目前氣: " & rawQiCurrent
TracePrint "OCR raw Max 氣: " & rawQiMax

TracePrint "OCR parsed 目前內力: " & OCRToNumber(rawNeiLiCurrent)
TracePrint "OCR parsed Max 內力: " & OCRToNumber(rawNeiLiMax)
TracePrint "OCR parsed 目前氣: " & OCRToNumber(rawQiCurrent)
TracePrint "OCR parsed Max 氣: " & OCRToNumber(rawQiMax)`

const SETTINGS_CODE = `cmdYaoJiu = "USE 藥酒"
afterDazuoYaoJiuCount = 5

cmdGuanDongZhu = "USE 關東煮"
guanDongZhuCooldownSec = 60

recoverTickSec = 15
dazuoRecoverTickSafetyLoss = 1

ocrSimilarity = 0.9
targetMaxNeiLi = 9999`

const COORD_NEILI = `rawNeiLiMax = OcrWithFallback(winX1 + 68, winY1 + 111, winX1 + 120, winY1 + 132, normalNeiLiColor, redNumColor, ocrSimilarity)`

const COORD_QI = `rawQiMax = OcrWithFallback(winX1 + 68, winY1 + 146, winX1 + 126, winY1 + 168, normalQiColor, redNumColor, ocrSimilarity)`

const LOG_SAMPLE = `畫面數值更新成功。
內力: xxxx / xxxx
氣: xxxx / xxxx
單次 DaZuo 可用上限: xxxx
發送指令: DaZuo xxxx
DaZuo 完成後固定飲藥酒。
OCR 確認突破成功。`

const BACKUP_LIST = `C:\\dm\\dm.dll
C:\\dm\\mud_num.txt
DaZuo OCR script
按鍵精靈腳本檔`

const PLUGIN_PATHS = `C:\\Program Files\\按键精灵2014\\Plugin
C:\\Program Files (x86)\\按键精灵2014\\Plugin
C:\\按键精灵2014\\Plugin\\`

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="ocr-section" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{title}</h2>
      <div className="ocr-section-content">{children}</div>
    </section>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="ocr-inline-code">{children}</code>
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-ink">{children}</strong>
}

function DownloadFile({ file }: { file: keyof typeof DOWNLOADS }) {
  return (
    <a className="ocr-doc-link" href={`/macros/${DOWNLOADS[file]}`} aria-label={`下載 ${DOWNLOADS[file]}`} download>
      <Download aria-hidden="true" size={16} />
      <span>{DOWNLOADS[file]}</span>
    </a>
  )
}

function AnjingLink() {
  return (
    <a className="ocr-doc-link" href="https://download.myanjian.com/" target="_blank" rel="noopener noreferrer">
      <ArrowUpRight aria-hidden="true" size={16} />
      <span>download.myanjian.com</span>
    </a>
  )
}

function ChapterIndex() {
  return (
    <nav aria-label="安裝教程章節">
      <ol className="ocr-index-list">
        {STEPS.map(({ id, label }, index) => (
          <li key={id}>
            <a href={`#${id}`}>
              <span className="ocr-index-number" aria-hidden="true">{String(index).padStart(2, '0')}</span>
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function Note({ variant = 'info', children }: { variant?: 'info' | 'ok'; children: React.ReactNode }) {
  const styles = variant === 'ok'
    ? 'border-green-500 bg-green-50 text-green-800'
    : 'border-rausch bg-rausch/5 text-ink'
  return <div className={`rounded-lg border-l-4 px-4 py-3 text-sm ${styles}`}>{children}</div>
}

function Checklist({ items, start = 1 }: { items: React.ReactNode[]; start?: number }) {
  return (
    <ol className="space-y-2" style={{ listStyleType: 'decimal', paddingLeft: '1.5em' }} start={start}>
      {items.map((item, i) => (
        <li key={i} className="text-sm leading-relaxed text-bodytext marker:font-semibold marker:text-rausch">
          {item}
        </li>
      ))}
    </ol>
  )
}

export default function DazuoOcrTutorialPage() {
  return (
    <div className="ocr-docs">
      <div className="ocr-docs-toolbar">
        <Link href="/tools/macros" className="ocr-doc-link ocr-back-link">
          <ArrowLeft aria-hidden="true" size={16} /> 按精教程
        </Link>
        <nav aria-label="測試程式碼捷徑" className="ocr-doc-shortcuts">
          <a className="ocr-doc-link" href="#test-dm">測試大漠</a>
          <a className="ocr-doc-link" href="#test-ocr">測試 OCR</a>
        </nav>
      </div>
      <div className="ocr-docs-layout">
        <aside className="ocr-index-desktop">
          <p className="ocr-index-title">安裝步驟</p>
          <ChapterIndex />
        </aside>
        <details className="ocr-index-mobile">
          <summary>安裝步驟 <ChevronDown aria-hidden="true" size={16} /></summary>
          <ChapterIndex />
        </details>
        <article className="ocr-docs-sheet">
          <header className="ocr-docs-intro">
            <h1>打坐 OCR 安裝教程</h1>
            <p>
              由安裝大漠 Plugin 到測試 OCR 讀數。腳本會讀取內力和氣，並自動打坐。適用於 Windows XP VM / VirtualBox、X-MudClient 同按鍵精靈 2014。
            </p>
          </header>

          {/* 0. Downloads */}
          <Section id="downloads" title="0. 下載檔案">
            <ul className="ocr-download-list">
              <li>
                <div><h3>按鍵精靈 / 按精</h3><p>安裝到預設位置。</p></div>
                <AnjingLink />
              </li>
              <li>
                <div>
                  <h3>大漠 Plugin（含註冊插件）</h3>
                  <p>解壓後：<Code>dm.dll</Code> 放入 <Code>C:\dm\</Code>；<Code>RegDll.dll</Code> 放入按鍵精靈 <Code>Plugin</Code> 資料夾。</p>
                </div>
                <DownloadFile file="plugin" />
              </li>
              <li>
                <div><h3>OCR 字庫</h3><p>放入 <Code>C:\dm\mud_num.txt</Code>。</p></div>
                <DownloadFile file="dictionary" />
              </li>
              <li>
                <div><h3>DaZuo OCR Script</h3><p>貼到按鍵精靈新腳本。</p></div>
                <DownloadFile file="script" />
              </li>
            </ul>
          </Section>

          {/* 1. Display */}
          <Section id="display" title="1. Windows XP 顯示設定">
            <Checklist items={[
              <>在桌面按右鍵，選擇 <Strong>內容</Strong>。</>,
              <>進入 <Strong>主題</Strong> 分頁。</>,
              <>主題選擇 <Strong>Windows 傳統配色</Strong>。</>,
              <>進入 <Strong>設定值</Strong> 分頁。</>,
              <>螢幕解析度設定為 <Strong>1280 × 960</Strong>。</>,
              <>色彩品質設定為 <Strong>最高（32 位元）</Strong>。</>,
              <>按 <Strong>套用</Strong>，再按 <Strong>確定</Strong>。</>,
            ]} />
          </Section>

          {/* 2. AnJing */}
          <Section id="anjing" title="2. 安裝按鍵精靈">
            <Checklist items={[
              <>
                開啟{' '}
                <AnjingLink />
                。
              </>,
              <>下載並安裝 PC 版按鍵精靈。</>,
              <>安裝完成後，先關閉按鍵精靈。</>,
              <>之後每次運行按鍵精靈，使用 <Strong>以系統管理員身份執行</Strong>。</>,
            ]} />
          </Section>

          {/* 3. DM Plugin */}
          <Section id="dm-plugin" title="3. 安裝大漠 Plugin">
            <Checklist items={[
              <>建立資料夾：<Code>C:\dm</Code></>,
              <>把 <Code>dm.dll</Code> 放入 <Code>C:\dm</Code>。</>,
              <>確認有：<Code>C:\dm\dm.dll</Code></>,
              <>把 <Code>RegDll.dll</Code> 複製到按鍵精靈的 <Code>Plugin</Code> 資料夾。</>,
              <>常見路徑如下，選擇你電腦實際存在的資料夾：</>,
            ]} />
            <CodePanel source={PLUGIN_PATHS} title="Plugin 資料夾" mode="text" />
            <Checklist start={6} items={[
              <>把 OCR 字庫放到：<Code>C:\dm\mud_num.txt</Code></>,
            ]} />
          </Section>

          {/* 4. Test DM */}
          <Section id="test-dm" title="4. 測試大漠 Plugin">
            <Checklist items={[
              <>用系統管理員身份打開按鍵精靈。</>,
              <>新建一個測試腳本。</>,
              <>貼上以下測試碼。</>,
              <>按 <Strong>調試 / F10</Strong>。</>,
            ]} />
            <CodePanel source={TEST_DM_CODE} title="測試大漠 Plugin" />
            <Note variant="ok">
              成功時，調試訊息會顯示：<Code>大漠版本: 3.1233</Code> 或其他大漠版本號。
            </Note>
          </Section>

          {/* 5. Dict */}
          <Section id="dict" title="5. 放置 OCR 字庫">
            <Checklist items={[
              <>
                下載{' '}
                <DownloadFile file="dictionary" />
                。
              </>,
              <>放入：<Code>C:\dm\mud_num.txt</Code></>,
              <>確認檔名與路徑完全正確（小寫 <Code>mud_num.txt</Code>）。</>,
            ]} />
          </Section>

          {/* 6. Test OCR */}
          <Section id="test-ocr" title="6. 測試 OCR 讀數">
            <Checklist items={[
              <>打開 X-MudClient。</>,
              <>確保左側狀態欄可見。</>,
              <>確保 <Strong>內力</Strong> 和 <Strong>氣</Strong> 數字可見。</>,
              <>新建一個 OCR 測試腳本。</>,
              <>貼上以下測試碼。</>,
              <>執行後，按提示把滑鼠移到 X-MudClient 視窗內，再按確定。</>,
            ]} />
            <CodePanel source={TEST_OCR_CODE} title="測試 OCR 讀數" />
            <Note variant="ok">
              成功時會讀到：目前內力、Max 內力、目前氣、Max 氣。
            </Note>
          </Section>

          {/* 7. Install Script */}
          <Section id="install-script" title="7. 安裝正式 DaZuo Script">
            <Checklist items={[
              <>在按鍵精靈新建腳本。</>,
              <>
                下載{' '}
                <DownloadFile file="script" />
                ，並把全部內容貼入。
              </>,
              <>保存腳本。</>,
              <>確認 script 內以下設定存在：</>,
            ]} />
            <CodePanel source={SETTINGS_CODE} title="腳本設定" />
            <Checklist start={5} items={[<>確認 Max 內力 OCR 座標使用：</>]} />
            <CodePanel source={COORD_NEILI} title="Max 內力座標" />
            <Checklist start={6} items={[<>確認 Max 氣 OCR 座標使用：</>]} />
            <CodePanel source={COORD_QI} title="Max 氣座標" />
          </Section>

          {/* 8. Run */}
          <Section id="run" title="8. 正式運行">
            <Checklist items={[
              <>打開 X-MudClient。</>,
              <>登入角色。</>,
              <>打開左側狀態欄。</>,
              <>確認內力和氣數字可見。</>,
              <>打開按鍵精靈。</>,
              <>選擇 DaZuo OCR script。</>,
              <>按 <Strong>啟動 / F10</Strong>。</>,
              <>輸入是否轉生：<Code>1</Code> 或 <Code>0</Code>。</>,
              <>輸入內功等級。</>,
              <>彈窗出現時，把滑鼠移到 X-MudClient 視窗內。</>,
              <>按確定。</>,
              <>觀察調試訊息。</>,
            ]} />
          </Section>

          {/* 9. Logs */}
          <Section id="logs" title="9. 正常運行時的調試訊息">
            <CodePanel source={LOG_SAMPLE} title="調試訊息" mode="log" />
          </Section>

          {/* 10. Troubleshoot */}
          <Section id="troubleshoot" title="10. 常見處理">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-ink">
                    <th className="py-3 pr-4 font-semibold">情況</th>
                    <th className="py-3 font-semibold">直接處理</th>
                  </tr>
                </thead>
                <tbody className="text-bodytext">
                  <tr className="border-b border-hairline-soft">
                    <td className="py-3 pr-4"><Code>SetDict ret: 0</Code></td>
                    <td className="py-3">確認 <Code>C:\dm\mud_num.txt</Code> 存在。</td>
                  </tr>
                  <tr className="border-b border-hairline-soft">
                    <td className="py-3 pr-4">讀不到大漠版本</td>
                    <td className="py-3">用系統管理員身份開按鍵精靈，確認 <Code>C:\dm\dm.dll</Code> 存在。</td>
                  </tr>
                  <tr className="border-b border-hairline-soft">
                    <td className="py-3 pr-4">找不到 X-MudClient 視窗</td>
                    <td className="py-3">彈窗時把滑鼠移到 X-MudClient 視窗內。</td>
                  </tr>
                  <tr className="border-b border-hairline-soft">
                    <td className="py-3 pr-4">Max 內力讀錯</td>
                    <td className="py-3">確認使用 <Code>winX1 + 68</Code> 至 <Code>winX1 + 120</Code>。</td>
                  </tr>
                  <tr className="border-b border-hairline-soft">
                    <td className="py-3 pr-4">Max 氣讀錯</td>
                    <td className="py-3">確認使用 <Code>winX1 + 68</Code> 至 <Code>winX1 + 126</Code>。</td>
                  </tr>
                  <tr className="border-b border-hairline-soft">
                    <td className="py-3 pr-4">紅色數字讀不到</td>
                    <td className="py-3">使用提供的新版 <Code>mud_num.txt</Code>。</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">OCR 讀到亂碼</td>
                    <td className="py-3">確認 Windows XP 解析度是 <Strong>1280 × 960</Strong>，色彩是 <Strong>最高 32 位元</Strong>。</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* 11. Backup */}
          <Section id="backup" title="11. 備份">
            <p className="text-sm text-bodytext">設定完成後，備份以下檔案：</p>
            <CodePanel source={BACKUP_LIST} title="備份清單" mode="text" />
          </Section>
        </article>
      </div>
    </div>
  )
}
