# 人在江湖資料庫（網站骨架）

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

