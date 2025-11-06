# Requirements Document

## Introduction

Molecule 是一個桌面 Widget 平台，旨在復興 Windows 7/Vista 時代的桌面小工具體驗，但使用現代 Web 技術（Electron + React）來解決原始的安全問題。該平台允許用戶在桌面上放置可自訂的小工具，開發者可以使用 React 創建 Widget，所有 Widget 在沙盒環境中安全運行，並提供 Marketplace 讓用戶發現和安裝新的 Widget。

## Glossary

- **Widget Container**: 基於 Electron 的桌面應用程式，負責管理和運行所有 Widget
- **Widget SDK**: React 元件庫和 API，供開發者創建 Widget
- **Widget**: 在桌面上顯示的小型應用程式（如時鐘、天氣、系統監控）
- **Marketplace**: Next.js 網站，用於展示和分發 Widget
- **Main Process**: Electron 主進程，負責系統級操作和視窗管理
- **Renderer Process**: Electron 渲染進程，負責 UI 顯示
- **Preload Script**: 在渲染進程中運行的腳本，提供安全的 IPC 橋接
- **Sandbox**: 隔離環境，限制 Widget 對系統資源的訪問
- **IPC**: Inter-Process Communication，進程間通訊機制
- **Widget Manager**: Widget Container 的主介面，用於管理已安裝的 Widget
- **CSP**: Content Security Policy，內容安全策略

## Requirements

### Requirement 1

**User Story:** 作為用戶，我想要在桌面上創建和顯示 Widget，以便快速查看資訊

#### Acceptance Criteria

1. WHEN 用戶啟動 Widget Container，THE Widget Container SHALL 顯示 Widget Manager 主視窗
2. WHEN 用戶從 Widget Manager 選擇一個 Widget，THE Widget Container SHALL 創建一個無邊框、透明、置頂的浮動視窗來顯示該 Widget
3. WHEN 用戶拖曳 Widget 視窗，THE Widget Container SHALL 更新 Widget 的位置並即時顯示
4. WHEN 用戶關閉 Widget Container 並重新啟動，THE Widget Container SHALL 在上次儲存的位置重新顯示所有 Widget
5. WHEN 用戶關閉某個 Widget 視窗，THE Widget Container SHALL 移除該 Widget 並更新 Widget Manager 的顯示狀態

### Requirement 2

**User Story:** 作為用戶，我想要 Widget 在沙盒環境中運行，以確保系統安全

#### Acceptance Criteria

1. THE Widget Container SHALL 在所有 Widget 視窗中啟用 Electron sandbox 模式
2. THE Widget Container SHALL 設置 nodeIntegration 為 false 且 contextIsolation 為 true
3. THE Widget Container SHALL 為所有 Widget 視窗配置 Content Security Policy，禁止執行未授權的腳本
4. WHEN Widget 嘗試訪問系統 API，THE Widget Container SHALL 通過 Preload Script 提供的安全橋接進行通訊
5. THE Widget Container SHALL 阻止 Widget 直接訪問 Node.js API 或 Electron API

### Requirement 3

**User Story:** 作為用戶，我想要控制 Widget 的權限，以保護我的隱私和系統安全

#### Acceptance Criteria

1. WHEN Widget 首次請求敏感權限（如系統資訊或網路訪問），THE Widget Container SHALL 顯示權限請求對話框
2. WHEN 用戶授予或拒絕權限，THE Widget Container SHALL 儲存用戶的選擇並在後續請求中自動應用
3. WHEN Widget 嘗試使用未授權的 API，THE Widget Container SHALL 拒絕請求並返回錯誤訊息
4. THE Widget Container SHALL 對每個 API 實施速率限制，防止 Widget 濫用系統資源
5. WHEN 用戶查看 Widget 詳情，THE Widget Container SHALL 顯示該 Widget 在 widget.config.json 中聲明的所有權限需求

### Requirement 4

**User Story:** 作為開發者，我想要使用 React 和簡單的 API 創建 Widget，以快速開發功能

#### Acceptance Criteria

1. THE Widget SDK SHALL 提供 WidgetAPI 介面，包含 storage、settings、ui 和 system 四個命名空間
2. THE Widget SDK SHALL 提供至少 15 個預製 UI 元件（如 Container、Title、Button、ProgressBar 等）
3. THE Widget SDK SHALL 提供 useWidgetAPI、useStorage、useSettings、useInterval 和 useSystemInfo 等 React Hooks
4. WHEN 開發者調用 storage.set(key, value)，THE Widget SDK SHALL 通過 IPC 將數據儲存到 Widget Container 的持久化存儲中
5. WHEN 開發者調用 system.getCPU()，THE Widget SDK SHALL 通過 IPC 從 Widget Container 獲取當前 CPU 使用率

### Requirement 5

**User Story:** 作為開發者，我想要在 widget.config.json 中聲明 Widget 的元數據和權限，以便系統正確載入和管理 Widget

#### Acceptance Criteria

1. THE Widget SDK SHALL 要求每個 Widget 包含 widget.config.json 文件
2. THE widget.config.json SHALL 包含 id、name、displayName、version、description、author 和 permissions 欄位
3. THE widget.config.json SHALL 在 permissions 欄位中聲明 systemInfo 和 network 權限需求
4. THE widget.config.json SHALL 在 sizes 欄位中定義 Widget 的預設寬度和高度
5. WHEN Widget Container 載入 Widget，THE Widget Container SHALL 驗證 widget.config.json 的格式並拒絕無效的配置

### Requirement 6

**User Story:** 作為用戶，我想要從 Marketplace 發現和安裝新的 Widget，以擴展平台功能

#### Acceptance Criteria

1. THE Marketplace SHALL 在首頁以網格形式顯示所有可用的 Widget
2. WHEN 用戶點擊 Widget 卡片，THE Marketplace SHALL 導航到該 Widget 的詳情頁
3. THE Widget 詳情頁 SHALL 顯示名稱、描述、作者、版本、下載數和權限需求
4. WHEN 用戶點擊 Install 按鈕，THE Marketplace SHALL 打開自訂 URL 協議（widget://install/xxx）
5. WHEN Widget Container 接收到安裝協議請求，THE Widget Container SHALL 下載、解壓並安裝該 Widget

### Requirement 7

**User Story:** 作為用戶，我想要使用時鐘 Widget 查看當前時間，以快速了解時間資訊

#### Acceptance Criteria

1. THE Clock Widget SHALL 顯示當前時間，格式為 HH:MM
2. THE Clock Widget SHALL 顯示當前日期
3. THE Clock Widget SHALL 每秒自動更新顯示的時間
4. THE Clock Widget SHALL 使用 Widget SDK 提供的 UI 元件進行佈局
5. THE Clock Widget SHALL 在 widget.config.json 中聲明不需要任何特殊權限

### Requirement 8

**User Story:** 作為用戶，我想要使用系統監控 Widget 查看 CPU 和記憶體使用情況，以監控系統性能

#### Acceptance Criteria

1. THE System Monitor Widget SHALL 顯示當前 CPU 使用率（百分比數字和進度條）
2. THE System Monitor Widget SHALL 顯示當前記憶體使用量（已使用/總量）
3. THE System Monitor Widget SHALL 每 2 秒更新一次系統資訊
4. WHEN System Monitor Widget 首次啟動，THE System Monitor Widget SHALL 請求 systemInfo 權限
5. THE System Monitor Widget SHALL 在 widget.config.json 中聲明需要 systemInfo.cpu 和 systemInfo.memory 權限

### Requirement 9

**User Story:** 作為用戶，我想要使用天氣 Widget 查看當前天氣，以了解外部環境

#### Acceptance Criteria

1. THE Weather Widget SHALL 從天氣 API 獲取並顯示當前溫度
2. THE Weather Widget SHALL 顯示天氣狀況（如晴天、多雲、雨天）
3. WHEN 用戶配置城市設定，THE Weather Widget SHALL 使用 settings API 儲存並讀取城市偏好
4. WHEN Weather Widget 首次啟動，THE Weather Widget SHALL 請求 network 權限
5. THE Weather Widget SHALL 在 widget.config.json 中聲明需要 network.enabled 權限

### Requirement 10

**User Story:** 作為用戶，我想要通過系統托盤快速訪問 Widget Manager，以方便管理 Widget

#### Acceptance Criteria

1. WHEN Widget Container 啟動，THE Widget Container SHALL 在系統托盤顯示圖示
2. WHEN 用戶右鍵點擊托盤圖示，THE Widget Container SHALL 顯示選單，包含「打開 Manager」和「退出」選項
3. WHEN 用戶選擇「打開 Manager」，THE Widget Container SHALL 顯示或聚焦 Widget Manager 視窗
4. WHEN 用戶選擇「退出」，THE Widget Container SHALL 關閉所有 Widget 視窗並退出應用程式
5. WHEN 用戶關閉 Widget Manager 視窗，THE Widget Container SHALL 隱藏視窗但保持應用程式在托盤中運行

### Requirement 11

**User Story:** 作為開發者，我想要在本地開發和測試 Widget，以提高開發效率

#### Acceptance Criteria

1. THE Widget SDK SHALL 提供開發模式，允許開發者在瀏覽器中預覽 Widget
2. WHEN 開發者運行 npm run dev，THE Widget 專案 SHALL 啟動 Vite 開發伺服器並自動重新載入變更
3. WHEN 開發者運行 npm run build，THE Widget 專案 SHALL 打包 Widget 為可分發的格式
4. THE Widget SDK SHALL 在開發模式下提供模擬的 WidgetAPI，無需連接到 Widget Container
5. THE Widget SDK SHALL 提供 TypeScript 類型定義，支援開發者的 IDE 自動完成

### Requirement 12

**User Story:** 作為用戶，我想要 Widget 具有美觀的毛玻璃效果，以提升視覺體驗

#### Acceptance Criteria

1. THE Widget Container SHALL 為所有 Widget 視窗應用毛玻璃背景效果（backdrop-filter: blur(10px)）
2. THE Widget Container SHALL 設置 Widget 視窗背景為半透明（rgba(255, 255, 255, 0.1)）
3. THE Widget Container SHALL 為 Widget 視窗添加 12px 圓角
4. THE Widget Container SHALL 為 Widget 視窗添加陰影效果（0 8px 32px rgba(0, 0, 0, 0.3)）
5. THE Widget SDK 提供的 UI 元件 SHALL 使用白色文字（rgba(255, 255, 255, 0.9)）以確保在透明背景上可讀

### Requirement 13

**User Story:** 作為平台管理員，我想要在 Marketplace 資料庫中儲存 Widget 資訊，以支援動態內容管理

#### Acceptance Criteria

1. THE Marketplace SHALL 使用 Supabase PostgreSQL 資料庫儲存 Widget 資訊
2. THE widgets 資料表 SHALL 包含 id、name、description、author、version、downloads 和 permissions 欄位
3. WHEN 用戶訪問 Marketplace 首頁，THE Marketplace SHALL 從資料庫查詢並顯示所有 Widget
4. WHEN 用戶搜索 Widget，THE Marketplace SHALL 在前端根據名稱和描述進行篩選
5. THE Marketplace SHALL 在資料庫中預先填充至少 5 個 Widget 的示範數據

### Requirement 14

**User Story:** 作為開發者，我想要 Widget Container 提供完整的 IPC 通訊系統，以實現 Widget 與主進程的安全互動

#### Acceptance Criteria

1. THE Widget Container SHALL 在 Main Process 中實現 ipc-handlers.js，處理所有來自 Renderer Process 的 IPC 訊息
2. THE Widget Container SHALL 提供 manager-preload.js，為 Widget Manager 提供安全的 API 橋接
3. THE Widget Container SHALL 提供 widget-preload.js，為 Widget 視窗提供安全的 API 橋接
4. WHEN Widget 調用 storage API，THE widget-preload.js SHALL 通過 ipcRenderer.invoke 發送訊息到 Main Process
5. WHEN Main Process 處理完請求，THE Main Process SHALL 通過 IPC 返回結果給 Renderer Process

### Requirement 15

**User Story:** 作為用戶，我想要 Widget Container 在多個 Widget 同時運行時保持良好性能，以確保流暢體驗

#### Acceptance Criteria

1. WHEN 5 個或更多 Widget 同時運行，THE Widget Container SHALL 保持總記憶體使用量低於 500MB
2. WHEN Widget 更新 UI，THE Widget Container SHALL 確保渲染幀率不低於 30 FPS
3. THE Widget Container SHALL 為每個 Widget 設置 CPU 使用率監控，當單個 Widget 持續超過 20% CPU 使用率時發出警告
4. THE Widget Container SHALL 實施 API 速率限制，每個 Widget 每秒最多調用系統 API 10 次
5. THE Widget Container SHALL 在 Widget 崩潰時隔離錯誤，不影響其他 Widget 或主應用程式的運行
