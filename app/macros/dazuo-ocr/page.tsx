import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DaZuo OCR 安裝教程｜按精教程',
  description: '按鍵精靈 + 大漠 Plugin + 打坐 OCR Script 完整安裝教程。',
}

const STEPS = [
  { id: 'downloads', label: '0. 下載檔案' },
  { id: 'display', label: '1. XP 顯示設定' },
  { id: 'anjing', label: '2. 安裝按精' },
  { id: 'dm-plugin', label: '3. 大漠 Plugin' },
  { id: 'test-dm', label: '4. 測試大漠' },
  { id: 'dict', label: '5. OCR 字庫' },
  { id: 'test-ocr', label: '6. 測試 OCR' },
  { id: 'install-script', label: '7. 安裝 Script' },
  { id: 'run', label: '8. 正式運行' },
  { id: 'logs', label: '9. 調試訊息' },
  { id: 'troubleshoot', label: '10. 常見處理' },
  { id: 'backup', label: '11. 備份' },
]

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
    <section id={id} className="rounded-2xl border border-hairline bg-canvas p-6 scroll-mt-20 sm:p-8">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-surface-soft px-1.5 py-0.5 font-mono text-sm text-ink">{children}</code>
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-ink">{children}</strong>
}

function Pre({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-ink p-4 text-sm leading-relaxed text-canvas">
      {children}
    </pre>
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
    <ol className="space-y-2" style={{ listStyleType: 'decimal', paddingLeft: '1.5em' }}>
      {items.map((item, i) => (
        <li key={i} className="text-sm leading-relaxed text-bodytext">
          <span className="font-semibold text-rausch">{start + i}.</span>{' '}
          {item}
        </li>
      ))}
    </ol>
  )
}

export default function DazuoOcrTutorialPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <header>
        <Link href="/macros" className="text-sm font-medium text-muted hover:text-rausch">
          ← 按精教程
        </Link>
        <div className="mt-3">
          <span className="pill">DaZuo OCR Setup Guide</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          按鍵精靈 + 大漠 Plugin + 打坐 OCR Script 安裝教程
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-bodytext">
          適用於 Windows XP VM / VirtualBox、X-MudClient、按鍵精靈 2014。照步驟完成即可運行 DaZuo OCR script，OCR 自動讀取內力與氣，全程自動打坐衝內力。
        </p>

        {/* TOC */}
        <nav className="mt-6 flex flex-wrap gap-2">
          {STEPS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="pill hover:bg-surface-soft"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      {/* 0. Downloads */}
      <Section id="downloads" title="0. 下載檔案">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-ink">
                <th className="py-3 pr-4 font-semibold">項目</th>
                <th className="py-3 pr-4 font-semibold">來源</th>
                <th className="py-3 font-semibold">安裝位置 / 檔名</th>
              </tr>
            </thead>
            <tbody className="text-bodytext">
              <tr className="border-b border-hairline-soft">
                <td className="py-3 pr-4">按鍵精靈 / 按精</td>
                <td className="py-3 pr-4">
                  <a href="https://download.myanjian.com/" target="_blank" rel="noopener" className="font-medium text-rausch hover:underline">
                    download.myanjian.com
                  </a>
                </td>
                <td className="py-3">安裝到預設位置</td>
              </tr>
              <tr className="border-b border-hairline-soft">
                <td className="py-3 pr-4">大漠 Plugin（含註冊插件）</td>
                <td className="py-3 pr-4">
                  <a href="/macros/dm-regdll-plugin.zip" download className="font-medium text-rausch hover:underline">
                    下載 dm-regdll-plugin.zip
                  </a>
                </td>
                <td className="py-2.5">
                  解壓後：<Code>dm.dll</Code> 放入 <Code>C:\dm\</Code>；
                  <Code>RegDll.dll</Code> 放入按鍵精靈 <Code>Plugin</Code> 資料夾
                </td>
              </tr>
              <tr className="border-b border-hairline-soft">
                <td className="py-3 pr-4">OCR 字庫</td>
                <td className="py-3 pr-4">
                  <a href="/macros/mud_num.txt" download className="font-medium text-rausch hover:underline">
                    下載 mud_num.txt
                  </a>
                </td>
                <td className="py-3">放入 <Code>C:\dm\mud_num.txt</Code></td>
              </tr>
              <tr>
                <td className="py-3 pr-4">DaZuo OCR Script</td>
                <td className="py-3 pr-4">
                  <a href="/macros/dazuo-ocr-script.txt" download className="font-medium text-rausch hover:underline">
                    下載 dazuo-ocr-script.txt
                  </a>
                </td>
                <td className="py-3">貼到按鍵精靈新腳本</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* 1. Display */}
      <Section id="display" title="1. Windows XP 顯示設定">
        <Checklist items={[
          <>在桌面按右鍵，選擇 <Strong>內容</Strong>。</>,
          <>進入 <Strong>主題</Strong> 分頁。</>,
          <>主題選擇 <Strong>Windows XP（已修改）</Strong>。</>,
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
            <a href="https://download.myanjian.com/" target="_blank" rel="noopener" className="font-medium text-rausch hover:underline">
              download.myanjian.com
            </a>
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
        <Pre>{PLUGIN_PATHS}</Pre>
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
        <Pre>{TEST_DM_CODE}</Pre>
        <Note variant="ok">
          成功時，調試訊息會顯示：<Code>大漠版本: 3.1233</Code> 或其他大漠版本號。
        </Note>
      </Section>

      {/* 5. Dict */}
      <Section id="dict" title="5. 放置 OCR 字庫">
        <Checklist items={[
          <>
            下載{' '}
            <a href="/macros/mud_num.txt" download className="font-medium text-rausch hover:underline">
              mud_num.txt
            </a>
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
        <Pre>{TEST_OCR_CODE}</Pre>
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
            <a href="/macros/dazuo-ocr-script.txt" download className="font-medium text-rausch hover:underline">
              dazuo-ocr-script.txt
            </a>
            ，並把全部內容貼入。
          </>,
          <>保存腳本。</>,
          <>確認 script 內以下設定存在：</>,
        ]} />
        <Pre>{SETTINGS_CODE}</Pre>
        <Checklist start={5} items={[<>確認 Max 內力 OCR 座標使用：</>]} />
        <Pre>{COORD_NEILI}</Pre>
        <Checklist start={6} items={[<>確認 Max 氣 OCR 座標使用：</>]} />
        <Pre>{COORD_QI}</Pre>
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
        <Pre>{LOG_SAMPLE}</Pre>
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
        <Pre>{BACKUP_LIST}</Pre>
      </Section>
    </div>
  )
}
