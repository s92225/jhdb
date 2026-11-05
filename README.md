# 人在江湖資料庫

## 版本來源與部署

- 程式碼版本依據：<https://github.com/s92225/jhdb> 的 `main`。
- 正式網站：<https://jhdb-kappa.vercel.app/>，由 Vercel 託管。
- 正常流程：分支修改 → 提交 PR → Vercel 預覽及測試 → merge `main` → Vercel 自動建置及更新正式網址。
- 本次同步來源是 2026-11-05 已驗證的正式部署 `dpl_FqC11WmYGjgPKcZsSnYuWh6sLacb`，不是尚未確認的本機工作目錄。
- 正常更新不可繞過 GitHub，亦不可從有未提交改動的本機資料夾直接部署正式站。緊急修復若必須直接部署，應在完成前將相同版本同步回 `main` 並核對部署的 Git commit。
- 密碼、資料庫連線及 OAuth secrets 只存於 Vercel 環境設定；不可提交 `.env*`、`.vercel`、資料庫內容或登入狀態。討論區資料在資料庫，並非 GitHub 程式碼備份的一部分。
- 人物屬性計算器內容及公式按使用者要求凍結，未在這次同步中修正或重新推導。三個檔案的正式站 SHA-256 記錄於 `tests/fixtures/production-calculator.json`；建置前會檢查，正常同步不得更新該基準繞過檢查。這只驗證「未改動」，不表示既有公式正確。
- 發佈後核對 Vercel 的 production commit、正式網址、首頁動態、搜尋、迷宮、既有討論區，以及計算器部署前後輸出。日常 Git 部署不執行資料庫 migration。

驗證指令：

```bash
npm ci
npm test
npm run build
```

以下保留原有匯入工具及資料結構說明。

原則：**不造資料**。任何缺的欄位保持空白。

## 開發

```bash
npm install
npm run dev
```

打開：http://localhost:3000

## 資料

- 原始 txt：`/data/raw/*.txt`
- 結構化 JSON：
  - `data/skills.json`
  - `data/quests.json`
  - `data/manuals.json`
  - `data/dungeons.json`
  - `data/updates.json`

> 目前 JSON 預設多為空陣列，是刻意的（避免亂填）。

## 匯入（骨架）

```bash
npm run import
```

目前匯入腳本只會把 `data/raw` 的 txt 原文收進 `updates.json`，其他表保持空。
你之後可以在 `scripts/import-from-txt.ts` 補解析規則，把門派/公共武技表格解析成 `skills.json`。

## 建議你後續要補的解析方向

- 門派/公共武技 txt：解析成 Skill / Move / Requirement
- update txt：解析成 UpdateNote，再反向補充 quest/manual/dungeon 條目（僅限文字中明確提到者）
