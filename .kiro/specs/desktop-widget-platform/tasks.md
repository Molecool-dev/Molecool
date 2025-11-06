# Implementation Plan

## Phase 1: 核心基礎設施

- [x] 1. 設置 Widget Container 專案結構





  - 初始化 Electron 專案，配置 TypeScript 和基本的 package.json
  - 創建 src/main、src/renderer、src/preload 目錄結構
  - 配置 electron-builder 用於打包
  - 安裝核心依賴：electron、electron-store
  - _Requirements: 1.1, 1.2_

- [x] 2. 實現基礎視窗系統





  - 創建 window-controller.js，實現 createWidgetWindow 和 createManagerWindow 方法
  - 配置 BrowserWindow 的安全選項（nodeIntegration: false, contextIsolation: true, sandbox: true）
  - 實現毛玻璃效果和透明背景
  - 創建無邊框、置頂的 Widget 視窗
  - _Requirements: 1.2, 2.1, 2.2, 12.1, 12.2, 12.3, 12.4_

- [x] 3. 建立 IPC 通訊基礎





  - 創建 ipc-handlers.js，設置 ipcMain.handle 的基本結構
  - 實現 widget-preload.js，使用 contextBridge 暴露安全的 API
  - 實現 manager-preload.js，為 Manager 提供 API
  - 測試基本的 renderer → main → renderer 通訊流程
  - _Requirements: 1.3, 2.4, 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 4. 實現數據持久化





  - 創建 storage.js，初始化 electron-store
  - 實現 setWidgetData、getWidgetData、deleteWidgetData 方法
  - 實現 saveWidgetState 和 getWidgetState 方法
  - 在 IPC handlers 中添加 storage:get、storage:set、storage:delete handlers
  - _Requirements: 1.4, 4.4_

- [x] 5. 實現 Widget 視窗拖曳功能










  - 在 window-controller.ts 中實現 enableDragging 方法
  - 監聽視窗移動事件，更新 Widget 位置
  - 實現位置自動儲存到 storage（500ms 防抖）
  - 智能檢測互動元素，避免拖曳衝突
  - 使用 delta-based 定位避免漂移
  - 測試拖曳功能和位置持久化
  - _Requirements: 1.3, 1.4_
  

## Phase 2: Widget SDK 核心

- [x] 6. 設置 Widget SDK 專案





  - 初始化 React + TypeScript + Vite 專案
  - 配置 package.json，設置為 library 模式
  - 配置 vite.config.ts，設置 build.lib 選項
  - 設置 TypeScript 類型定義導出
  - _Requirements: 4.1, 11.5_

- [x] 7. 實現核心 API 介面











  - 創建 core/WidgetAPI.ts，定義 WidgetAPIContext、StorageAPI、SettingsAPI、SystemAPI、UIAPI 介面
  - 實現 WidgetProvider 元件，創建 React Context
  - 實現開發模式的模擬 API（createMockAPI）
  - 實現 API 與 window.widgetAPI 的橋接
  - _Requirements: 4.1, 4.2, 11.4_

- [x] 8. 實現基礎 React Hooks




  - 創建 hooks/useWidgetAPI.ts
  - 創建 hooks/useInterval.ts，實現定時器 Hook
  - 創建 hooks/useStorage.ts，實現響應式 storage Hook
  - 創建 hooks/useSettings.ts
  - _Requirements: 4.3_

- [x] 9. 實現基礎 UI 元件（第一批 8 個）





  - 創建 components/Widget.tsx，實現 Container 元件
  - 創建 components/Typography.tsx，實現 Title、LargeText、SmallText 元件
  - 創建 components/Buttons.tsx，實現 Button 元件
  - 創建 components/Layout.tsx，實現 Grid、Divider、Header 元件
  - 為所有元件添加 CSS Modules 樣式，應用毛玻璃效果
  - _Requirements: 4.2, 12.5_

- [x] 10. 實現進階 UI 元件（第二批 7 個）





  - 創建 components/DataDisplay.tsx，實現 Stat、ProgressBar 元件
  - 創建 components/Forms.tsx，實現 Input、Select 元件
  - 創建 components/List.tsx，實現 List、ListItem 元件
  - 創建 components/Badge.tsx 和 Link.tsx
  - 為所有元件添加 TypeScript 類型定義和樣式
  - _Requirements: 4.2_


## Phase 3: Widget Manager 和生命週期

- [x] 11. 實現 Widget Manager 核心邏輯





  - 創建 widget-manager.js，定義 WidgetInstance 介面
  - 實現 loadInstalledWidgets 方法，掃描 widgets 目錄
  - 實現 createWidget 方法，創建 Widget 視窗並載入內容
  - 實現 closeWidget 方法，清理資源
  - 實現 getRunningWidgets 方法
  - _Requirements: 1.1, 1.5_

- [x] 12. 實現 Widget 狀態管理





  - 在 widget-manager.js 中實現 saveWidgetState 方法
  - 實現 restoreWidgets 方法，在應用啟動時恢復上次的 Widget
  - 在 Widget 關閉時自動儲存狀態
  - 測試重啟後 Widget 位置和狀態恢復
  - _Requirements: 1.4, 1.5_

- [x] 13. 創建 Widget Manager UI





  - 創建 src/renderer/manager.html，設計 Manager 介面
  - 創建 src/renderer/manager.js，實現 Widget 列表顯示
  - 實現「創建 Widget」按鈕，調用 IPC 創建 Widget
  - 實現「關閉 Widget」功能
  - 顯示運行中的 Widget 列表
  - _Requirements: 1.1, 1.5_

- [x] 14. 實現 widget.config.json 驗證





  - 在 widget-manager.js 中添加 validateConfig 方法
  - 驗證必要欄位：id, name, displayName, version, permissions, sizes
  - 驗證 permissions 結構
  - 拒絕載入無效的 Widget 配置
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


## Phase 4: 系統 API 和權限

- [ ] 15. 實現系統資訊 API
  - 創建 system-api.js，使用 Node.js os 模組
  - 實現 getCPUUsage 方法，計算 CPU 使用率
  - 實現 getMemoryInfo 方法，返回記憶體資訊
  - 實現 getSystemInfo 方法，返回完整系統資訊
  - _Requirements: 4.5, 8.1, 8.2_

- [ ] 16. 實現權限管理系統
  - 創建 permissions.js，定義 PermissionSet 介面
  - 實現 hasPermission 方法，檢查 Widget 權限
  - 實現 savePermission 和 getPermissions 方法
  - 在 storage.js 中添加權限儲存功能
  - _Requirements: 3.2, 3.3, 8.4_

- [ ] 17. 實現權限請求對話框
  - 在 permissions.js 中實現 requestPermission 方法
  - 使用 Electron dialog 顯示權限請求對話框
  - 顯示 Widget 名稱和請求的權限
  - 儲存用戶的授權決定
  - _Requirements: 3.1, 3.5_

- [ ] 18. 實現 API 速率限制
  - 在 permissions.js 中實現 checkRateLimit 方法
  - 使用 Map 記錄每個 Widget 的 API 調用次數
  - 設置每秒最多 10 次調用的限制
  - 超過限制時拋出 RATE_LIMIT_EXCEEDED 錯誤
  - _Requirements: 3.4, 15.4_

- [ ] 19. 整合系統 API 到 IPC handlers
  - 在 ipc-handlers.js 中添加 system:getCPU 和 system:getMemory handlers
  - 在 handlers 中調用權限檢查和速率限制
  - 在 widget-preload.js 中暴露 system API
  - 測試權限請求流程
  - _Requirements: 4.5, 8.4, 8.5_

- [ ] 20. 實現 useSystemInfo Hook
  - 創建 hooks/useSystemInfo.ts
  - 使用 useInterval 定期獲取系統資訊
  - 處理權限拒絕錯誤
  - 支援 CPU 和記憶體兩種類型
  - _Requirements: 4.3, 8.3_


## Phase 5: 範例 Widgets

- [ ] 21. 創建 Clock Widget
  - 初始化 examples/clock 專案，安裝 Widget SDK
  - 創建 widget.config.json，聲明不需要特殊權限
  - 創建 src/index.tsx，實現時鐘 UI
  - 使用 useState 和 useInterval 實現每秒更新
  - 顯示 HH:MM 格式的時間和日期
  - 使用 Widget.Container、Widget.LargeText、Widget.SmallText 元件
  - 配置 Vite 打包
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 22. 創建 System Monitor Widget
  - 初始化 examples/system-monitor 專案
  - 創建 widget.config.json，聲明需要 systemInfo.cpu 和 systemInfo.memory 權限
  - 創建 src/index.tsx，實現系統監控 UI
  - 使用 useSystemInfo Hook 獲取 CPU 和記憶體資訊
  - 使用 Widget.Stat 和 Widget.ProgressBar 顯示數據
  - 每 2 秒更新一次數據
  - 測試權限請求流程
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 23. 創建 Weather Widget
  - 初始化 examples/weather 專案
  - 創建 widget.config.json，聲明需要 network 權限和允許的天氣 API 域名
  - 創建 src/index.tsx，實現天氣 UI
  - 使用 useSettings Hook 讀取城市設定
  - 實現 fetchWeather 函數，調用天氣 API
  - 使用 useInterval 每 10 分鐘更新天氣
  - 顯示溫度和天氣狀況
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_


## Phase 6: Marketplace 基礎

- [ ] 24. 設置 Marketplace 專案
  - 初始化 Next.js 15 專案（App Router）
  - 安裝 Tailwind CSS 和配置
  - 設置 Supabase 客戶端（lib/supabase.ts）
  - 配置環境變數（NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY）
  - _Requirements: 13.1_

- [ ] 25. 創建 Supabase 資料庫 Schema
  - 在 Supabase 中創建 widgets 表
  - 定義欄位：id, widget_id, name, display_name, description, author_name, author_email, version, downloads, permissions, sizes, icon_url, download_url, created_at, updated_at
  - 創建索引：idx_widgets_widget_id, idx_widgets_downloads
  - 填充 5-10 個範例 Widget 數據
  - _Requirements: 13.2, 13.5_

- [ ] 26. 實現 Marketplace 首頁
  - 創建 app/page.tsx，實現首頁佈局
  - 從 Supabase 查詢所有 Widget
  - 創建 components/WidgetCard.tsx，顯示 Widget 卡片
  - 使用 Grid 佈局顯示 Widget 列表
  - 顯示 Widget 名稱、描述、下載數
  - _Requirements: 6.1, 13.3_

- [ ] 27. 實現搜索功能
  - 創建 components/SearchBar.tsx
  - 實現前端搜索，根據名稱和描述篩選
  - 使用 useState 管理搜索狀態
  - 即時更新搜索結果
  - _Requirements: 13.4_

- [ ] 28. 實現 Widget 詳情頁
  - 創建 app/widgets/[id]/page.tsx
  - 從 Supabase 查詢單個 Widget
  - 顯示完整的 Widget 資訊（名稱、描述、作者、版本、下載數）
  - 創建 components/PermissionsList.tsx，顯示權限需求
  - 實現 Install 按鈕，打開 widget://install/xxx 協議
  - 處理 Widget 不存在的情況（404）
  - _Requirements: 6.2, 6.3, 6.4_


## Phase 7: Widget 安裝機制

- [ ] 29. 實現自訂 URL 協議
  - 在 Widget Container 中註冊 widget:// 協議
  - 使用 app.setAsDefaultProtocolClient('widget')
  - 監聽 open-url 事件（macOS）和 second-instance 事件（Windows）
  - 解析 widget://install/xxx URL，提取 Widget ID
  - _Requirements: 6.5_

- [ ] 30. 實現 Widget 下載和安裝
  - 在 widget-manager.js 中實現 installWidget 方法
  - 從 Marketplace API 獲取 Widget 下載 URL
  - 下載 Widget 文件（.widget zip）
  - 解壓到 widgets 目錄
  - 驗證 widget.config.json
  - 添加到已安裝 Widget 列表
  - _Requirements: 6.5_


## Phase 8: 系統托盤和優化

- [ ] 31. 實現系統托盤
  - 在 main process 中創建 Tray 實例
  - 設置托盤圖示
  - 創建右鍵選單（打開 Manager、退出）
  - 實現「打開 Manager」功能，顯示或聚焦 Manager 視窗
  - 實現「退出」功能，關閉所有 Widget 並退出應用
  - 關閉 Manager 視窗時隱藏而不退出
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 32. 實現錯誤處理
  - 創建 WidgetError 類和 WidgetErrorType 枚舉
  - 在所有 IPC handlers 中添加 try-catch
  - 返回標準化的錯誤響應 { success: false, error: { type, message } }
  - 在 Widget SDK 中處理錯誤，拋出 WidgetError
  - 在 WidgetProvider 中添加 Error Boundary
  - _Requirements: 15.5_

- [ ] 33. 實現性能優化
  - 在 BrowserWindow 配置中啟用硬體加速和 v8 緩存
  - 實現 Widget 數量限制（最多 10 個）
  - 在 closeWidget 中清理事件監聽器和資源
  - 監控 Widget CPU 使用率，超過 20% 時記錄警告
  - 在 Widget SDK 中提供 useThrottle Hook
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [ ] 34. 實現 CSP 和安全配置
  - 在 session.defaultSession.webRequest.onHeadersReceived 中設置 CSP
  - 配置 default-src 'none', script-src 'self', style-src 'self' 'unsafe-inline'
  - 根據 Widget 配置動態設置 connect-src 白名單
  - 在 onBeforeRequest 中阻止 HTTP 請求，只允許 HTTPS
  - 測試 CSP 是否正確阻止未授權的腳本和網路請求
  - _Requirements: 2.3, 2.5_


## Phase 9: 測試和文檔

- [ ] 35. 編寫單元測試

  - [ ] 35.1 為 widget-manager.js 編寫 Jest 測試

    - 測試 createWidget 和 closeWidget 方法
    - 測試 Widget 狀態管理
    - _Requirements: 1.1, 1.5_
  
  - [ ] 35.2 為 Widget SDK Hooks 編寫 Vitest 測試

    - 測試 useStorage Hook 的 get/set/remove 功能
    - 測試 useInterval Hook
    - 使用 React Testing Library
    - _Requirements: 4.3_

- [ ] 36. 編寫集成測試


  - [ ] 36.1 測試 IPC 通訊

    - 測試 storage API 的完整流程
    - 測試 system API 的權限檢查
    - _Requirements: 14.4, 14.5_

- [ ] 37. 執行手動測試

  - [ ] 37.1 測試 Widget 生命週期

    - 驗證 Widget 可以正常創建和關閉
    - 驗證 Widget 可以拖曳
    - 驗證 Widget 位置在重啟後保持
    - _Requirements: 1.1, 1.3, 1.4_
  
  - [ ] 37.2 測試權限系統

    - 驗證權限對話框正常顯示
    - 驗證權限授予和拒絕功能
    - 驗證速率限制
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 37.3 測試範例 Widgets

    - 驗證 Clock Widget 正常顯示和更新
    - 驗證 System Monitor Widget 顯示正確的系統資訊
    - 驗證 Weather Widget 可以獲取天氣數據
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 9.1, 9.2_
  
  - [ ] 37.4 測試 Marketplace

    - 驗證首頁顯示 Widget 列表
    - 驗證搜索功能
    - 驗證詳情頁顯示完整資訊
    - 驗證 Install 按鈕觸發協議
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 38. 編寫文檔

  - [ ] 38.1 創建 README.md

    - 專案概述和功能介紹
    - 安裝和運行指南
    - 開發環境設置
    - _Requirements: All_
  
  - [ ]* 38.2 創建 Widget 開發者文檔
    - Widget SDK API 參考
    - 創建新 Widget 的教程
    - widget.config.json 配置說明
    - 權限系統說明
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_
  
  - [ ]* 38.3 創建架構文檔
    - 系統架構圖
    - IPC 通訊流程
    - 安全機制說明
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_


## Phase 10: 最終整合和部署

- [ ] 39. UI/UX 拋光
  - 為所有 UI 元件添加過渡動畫（fadeIn, hover 效果）
  - 優化毛玻璃效果的視覺表現
  - 確保所有文字在透明背景上可讀
  - 添加 Widget 出現和消失的動畫
  - 優化 Manager UI 的佈局和樣式
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 40. 跨平台測試
  - 在 Windows 10/11 上測試所有功能
  - 測試系統托盤在 Windows 上的表現
  - 測試自訂協議在 Windows 上的註冊
  - 如果可能，在 macOS 上測試
  - 修復平台特定的問題
  - _Requirements: All_

- [ ] 41. 打包和構建
  - 配置 electron-builder 的 Windows 和 macOS 目標
  - 設置應用圖示（icon.ico 和 icon.icns）
  - 構建 Windows 安裝程式（NSIS）
  - 構建 macOS DMG（如果可能）
  - 測試安裝程式
  - _Requirements: All_

- [ ] 42. 部署 Marketplace
  - 配置 Vercel 專案
  - 設置環境變數（Supabase 連接）
  - 部署到生產環境
  - 測試生產環境的功能
  - 配置自訂域名（可選）
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 43. 準備演示
  - 創建演示腳本，展示核心功能
  - 準備 3 個範例 Widget 的演示
  - 準備 Marketplace 的演示
  - 準備安裝和使用流程的演示
  - 錄製演示視頻（可選）
  - _Requirements: All_

- [ ] 44. 最終檢查和 Bug 修復
  - 執行完整的功能測試清單
  - 修復發現的所有 critical bugs
  - 優化性能瓶頸
  - 確保所有需求都已實現
  - 準備黑客松提交材料
  - _Requirements: All_

## 注意事項

### 開發優先級

1. **Phase 1-3**: 核心基礎設施和 SDK（Week 1）- 最高優先級
2. **Phase 4-5**: 系統 API 和範例 Widgets（Week 2）- 高優先級
3. **Phase 6-7**: Marketplace 和安裝機制（Week 3）- 中優先級
4. **Phase 8-10**: 優化和部署（Week 4）- 最終階段

### MVP 定義

最小可行產品必須包含：
- ✅ Electron 應用可以啟動並創建 Widget 視窗
- ✅ Widget SDK 可以正常使用
- ✅ 至少 1 個可運行的範例 Widget（Clock）
- ✅ Widget 可以拖曳和儲存位置
- ✅ 基礎的沙盒安全機制
- ✅ Storage API 正常工作

有了這些，專案就能正常演示。其他功能都是加分項。

### 可選功能（時間不足時可跳過）

- 系統托盤（Task 31）
- Weather Widget（Task 23）
- Widget 安裝機制（Task 29-30）
- 所有標記為 * 的測試和文檔任務

### 技術債務追蹤

在開發過程中，如果遇到需要後續優化的地方，記錄在 TODO 註釋中：

```typescript
// TODO: 實現更精確的 CPU 使用率計算
// TODO: 添加 Widget 更新機制
// TODO: 支援 Widget 主題自訂
```

這些可以在黑客松後繼續完善。
