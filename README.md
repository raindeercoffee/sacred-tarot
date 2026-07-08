# 神聖抽牌 · Sacred Thoth Tarot Oracle

托特塔羅牌線上抽牌工具：元辰宮、易經、脈輪三種占卜模式。純靜態網頁，無需後端。

## 部署到 GitHub Pages

1. 在 GitHub 建立一個新的 repository（例如 `sacred-tarot`）。
2. 把這個資料夾內的所有檔案（`index.html`、`manifest.json`、`icons/`）推上去：
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<你的帳號>/<repo名稱>.git
   git push -u origin main
   ```
3. 到 repository 的 **Settings → Pages**，Source 選擇 `main` 分支、`/ (root)` 資料夾，儲存。
4. 幾分鐘後即可透過 `https://<你的帳號>.github.io/<repo名稱>/` 開啟網站。

## 加入手機／桌面主畫面

- **iPhone (Safari)**：開啟網站 → 分享 → 加入主畫面，會顯示金色星星圖示。
- **Android (Chrome)**：開啟網站 → 選單 → 新增至主畫面（或瀏覽器會自動跳出安裝提示，因為已設定 `manifest.json`）。
- **桌面 (Chrome/Edge)**：網址列右側的安裝圖示 → 安裝應用程式。

## 檔案結構

```
神聖塔羅/
├── index.html          網站主檔案
├── manifest.json        PWA 設定（決定加入主畫面時的圖示與名稱）
└── icons/
    ├── favicon.ico
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-48.png
    ├── icon-192.png
    ├── icon-512.png
    └── apple-touch-icon.png   (180x180，iOS 加入主畫面用)
```
