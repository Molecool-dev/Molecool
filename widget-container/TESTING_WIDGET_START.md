# Widget 啟動測試指南

## 問題描述
點擊 Widget Manager 中的 "Launch" 按鈕無法啟動 widget。

## 已修復的問題

### 1. 事件委託
- **問題**: 使用內聯 `onclick` 屬性可能導致作用域問題
- **修復**: 改用事件委託，在父元素上監聽點擊事件
- **位置**: `src/renderer/manager.js`

### 2. 調試日誌
- 添加了詳細的 console.log 來追蹤執行流程
- 每個關鍵步驟都有 `[toggleWidget]` 或 `[loadWidgets]` 前綴

## 測試步驟

### 1. 重新編譯並啟動應用
```powershell
cd widget-container
npm run build
npm start
```

### 2. 打開 DevTools
- 應用啟動後，DevTools 應該會自動打開（開發模式）
- 如果沒有，按 `Ctrl+Shift+I` 或 `F12`

### 3. 檢查 Console 輸出
啟動時應該看到：
```
Widget Manager loaded
window.managerAPI available: true
[loadWidgets] Fetching installed widgets...
[loadWidgets] Installed widgets: [...]
[loadWidgets] Fetching running widgets...
[loadWidgets] Running widgets: [...]
```

### 4. 點擊 Launch 按鈕
點擊任何 widget 的 "▶ Launch" 按鈕，應該看到：
```
[Event Delegation] Button clicked: { widgetId: 'clock-widget', isRunning: false }
[toggleWidget] Called with: { widgetId: 'clock-widget', isRunning: false }
[toggleWidget] window.managerAPI: [object Object]
[toggleWidget] Launching widget: clock-widget
[toggleWidget] Calling window.managerAPI.widgets.create...
[toggleWidget] Widget launched successfully with instance ID: [uuid]
[toggleWidget] Reloading widget list...
[toggleWidget] Widget list reloaded
```

### 5. 檢查 Widget 窗口
- 應該會出現一個新的 widget 窗口
- Widget 窗口應該顯示 widget 的內容

## 可能的錯誤情況

### 錯誤 1: "Manager API not available"
**原因**: preload script 沒有正確加載
**檢查**:
1. 確認 `dist/preload/manager-preload.js` 存在
2. 檢查 console 是否有 preload 相關錯誤

### 錯誤 2: "Widget manager not initialized"
**原因**: main process 的 widget manager 沒有正確初始化
**檢查**:
1. 查看 main process 的 console 輸出
2. 確認看到 "✓ IPC handlers registered successfully"

### 錯誤 3: "Widget entry point not found"
**原因**: widget 的 dist 文件沒有編譯
**解決**:
```powershell
cd widgets/clock-widget
npm install
npm run build
```

### 錯誤 4: Widget 窗口一閃而過
**原因**: widget 的 JavaScript 有錯誤導致崩潰
**檢查**:
1. 在 main process console 查看錯誤
2. 檢查 widget 的 dist/index.html 是否正確

## 調試技巧

### 1. 查看 Main Process 日誌
Main process 的日誌會顯示在啟動應用的終端中：
```powershell
npm start
```

### 2. 查看 Renderer Process 日誌
Renderer process 的日誌在 DevTools Console 中。

### 3. 檢查 IPC 通信
在 DevTools Console 中手動測試：
```javascript
// 測試 API 是否可用
console.log(window.managerAPI);

// 測試獲取已安裝的 widgets
window.managerAPI.widgets.getInstalled().then(console.log);

// 測試獲取運行中的 widgets
window.managerAPI.widgets.getRunning().then(console.log);

// 測試創建 widget
window.managerAPI.widgets.create('clock-widget').then(console.log);
```

## 預期結果

成功啟動 widget 後：
1. Widget Manager 中的狀態應該從 "○ Stopped" 變為 "● Running"
2. 按鈕文字應該從 "▶ Launch" 變為 "✕ Close"
3. 應該出現一個新的 widget 窗口
4. Widget 窗口應該可以拖動
5. Widget 窗口應該顯示正確的內容

## 下一步

如果仍然無法啟動，請提供：
1. DevTools Console 的完整輸出
2. Main process terminal 的完整輸出
3. 點擊按鈕時的具體錯誤訊息
