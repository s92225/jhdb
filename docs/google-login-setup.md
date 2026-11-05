# JHDB：建立 Google 登入

這份指引適用於目前的 Better Auth + Neon PostgreSQL 討論區。Vercel 已授權，但這不等於已建立 Google OAuth Client。

## 1. 建立 Google Cloud 專案

1. 開啟 [Google Cloud Console](https://console.cloud.google.com/)，選擇或建立專案，例如 `JHDB`。
2. 開啟 **Google Auth Platform → Branding**，按 Get started。
3. App name 填 `人在江湖資料庫`，支援／聯絡電郵填你的管理員電郵。
4. Audience 選 **External**，因為其他玩家也需要登入。
5. Data Access 只使用基本身份：`openid`、`email`、`profile`。不需要 Gmail、Drive、聯絡人 API 或權限。

若 Google 要求應用程式首頁及私隱政策網址，使用正式網站和 `/forum/rules`。正式網域若不同，以下網址也要一併更新。不要把 `vercel.app` 當成自己擁有的頂級授權網域；如驗證流程要求網域擁有權，使用你自己的網域。

## 2. 建立 OAuth Client

Google Auth Platform → **Clients → Create client**：

- Application type：**Web application**
- Name：`JHDB Web`
- Authorized JavaScript origins（如填寫）：
  - `https://jhdb-kappa.vercel.app`
  - `http://localhost:3014`
- **Authorized redirect URIs**（必須逐字相同，沒有結尾斜線）：

```text
https://jhdb-kappa.vercel.app/api/auth/callback/google
http://localhost:3014/api/auth/callback/google
```

請使用實際設定的 `BETTER_AUTH_URL` 對應網址，勿填萬用字元或每次改變的隨機預覽域名。

## 3. 放入 Vercel，勿在對話貼出 secret

開啟 [JHDB 環境變數設定](https://vercel.com/s92225s-projects/jhdb/settings/environment-variables)，加入：

| 名稱 | 值 | 環境 |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | Google 顯示的 Client ID | Production；如需本機測試也加 Development |
| `GOOGLE_CLIENT_SECRET` | Google 顯示的 Client secret | Production；如需本機測試也加 Development |

Secret 使用敏感／Secret 類型，不要加 `NEXT_PUBLIC_`。本機環境檔不可提交 Git。預覽環境不應共用正式 OAuth 網址／資料；需另設固定網址與對應憑證。

網站還需要伺服器端的 `DATABASE_URL`、隨機 `BETTER_AUTH_SECRET`、`BETTER_AUTH_URL` 和 `FORUM_ADMIN_EMAIL`。這些由網站部署設定管理，不是 Google Client 內容。管理員權限只在伺服器按已驗證 Google 電郵判定，不能在會員設定自行升權。

## 4. 測試及正式開放

1. Audience 如仍是 **Testing**，先在 Test users 加入自己的 Google 電郵及測試玩家。
2. 加好後通知開發者，先部署包含討論區的新版本。更新 Vercel 變數後需要重新部署才會生效；不要只重建仍未包含討論區的舊版本。
3. 開啟會員設定，以自己的 Google 帳戶登入。應可進入版務管理；另一個普通玩家帳戶不可。
4. 用兩個帳戶測試：發帖 → 另一人回覆 → 修改自己的內容 → 管理員置頂／鎖定／隱藏／還原 → 保存遊戲 ID → 登出。
5. 確認後依 Google Console 指示將 Audience 設為 **In production**。是否需要品牌或網域驗證，以 Google Console 當時顯示為準。

**另注意：**目前 Vercel 部署有存取保護。要讓一般玩家使用，仍需確認正式網域及對外存取政策；不要為了測試而自動關閉保護。

常見錯誤：`redirect_uri_mismatch` 表示 Google Client 的 redirect URI 與網站 base URL 不一致；`access_denied` 可能是 Testing 階段未加 test user。不要貼出錯誤頁上的 code、token 或完整 Cookie。

官方參考：[Google OAuth Web server](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred)、[Better Auth Google](https://www.better-auth.com/docs/authentication/google)。
