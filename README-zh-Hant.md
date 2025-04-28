<h1 align="center">
    <img src="https://github.com/user-attachments/assets/ec60b0c4-87ba-48f4-981a-c55ed0e8497b" height="100" width="375" alt="banner" /><br>
</h1>


<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/NB1)
[![Twitter](https://img.shields.io/badge/Twitter-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/NB1_ai)
[![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/NN3ABHggMK)

</div>

## 🌐 NB1

NB1 是一個在瀏覽器中運行的開源 AI 網頁自動化工具。它是 OpenAI Operator 的免費替代品，提供靈活的 LLM 選項和多代理系統。

⬇️ 免費從 [Chrome Web Store 獲取 NB1](https://chromewebstore.google.com/detail/NB1/imbddededgmcgfhfpcjmijokokekbkal)

👏 加入 [Discord](https://discord.gg/NN3ABHggMK) | [X](https://x.com/NB1_ai) 社群

❤️ 喜歡 NB1？給我們一個星星 🌟 並幫助傳播消息！

<div align="center">
<img src="https://github.com/user-attachments/assets/112c4385-7b03-4b81-a352-4f348093351b" width="600" alt="NB1 Demo GIF" />
<p><em>NB1 的多代理系統實時分析 HuggingFace，Planner 智能地在遇到障礙時自我糾正，並動態指導 Navigator 調整其方法—全部在您的瀏覽器中本地運行。</em></p>
</div>

## 🔥為什麼選擇 NB1？

想要強大的 AI 網頁代理，但不想每月支付 OpenAI Operator $200 的費用？**NB1** 作為 Chrome 擴展程式，提供高級網頁自動化功能，同時讓您完全掌控：

- **100% 免費** - 沒有訂閱費或隱藏成本。只需安裝並使用您自己的 API keys，您只需支付使用自己 API keys 的費用。
- **注重隱私** - 一切都在您的本地瀏覽器中運行。您的憑證保留在您這裡，絕不與任何雲服務共享。
- **靈活的 LLM 選項** - 連接到您偏好的 LLM providers，並可為不同的代理選擇不同的模型。
- **完全開源** - 瀏覽器自動化過程完全透明。沒有黑盒或隱藏的處理程序。

> **注意：** 我們目前支持 OpenAI、Anthropic、Gemini、Ollama 和自定義 OpenAI 兼容的 providers，未來會支持更多 providers。


## 📊 主要特點

- **多代理系統**：專業 AI 代理協作完成複雜的網頁工作流程
- **互動側邊欄**：直觀的聊天界面，提供實時狀態更新
- **任務自動化**：在不同網站間無縫自動化重複性網頁自動化任務
- **後續問題**：針對已完成任務提出上下文相關的後續問題
- **對話歷史**：輕鬆訪問和管理您的 AI 代理互動歷史
- **多 LLM 支持**：連接您偏好的 LLM providers，並為不同代理分配不同模型


## 🚀 快速開始

1. **從 Chrome Web Store 安裝**（穩定版）：
   * 訪問 [NB1 Chrome Web Store 頁面](https://chromewebstore.google.com/detail/NB1/imbddededgmcgfhfpcjmijokokekbkal)
   * 點擊「加到 Chrome」按鈕
   * 確認安裝

> **重要提示**：如需最新功能，請從下方的[「手動安裝最新版本」](#-手動安裝最新版本)安裝，因為 Chrome Web Store 版本可能會因審核流程而延遲。

2. **配置代理模型**：
   * 點擊工具欄中的 NB1 圖標打開側邊欄
   * 點擊 `設置` 圖標（右上角）
   * 添加您的 LLM API keys
   * 選擇為不同代理（Navigator、Planner、Validator）使用的模型

## 🔧 手動安裝最新版本

若要獲取具有所有最新功能的最新版本：

1. **下載**
    * 從官方 Github [release page](https://github.com/NB1/NB1/releases)下載最新的 `NB1.zip` 文件。

2. **安裝**：
    * 解壓縮 `NB1.zip`。
    * 在 Chrome 中打開 `chrome://extensions/`
    * 啟用 `開發人員模式`（右上角）
    * 點擊 `載入未封裝項目`（左上角）
    * 選擇解壓縮後的 `NB1` 文件夾。

3. **配置代理模型**
    * 點擊工具欄中的 NB1 圖標打開側邊欄
    * 點擊 `設置` 圖標（右上角）。
    * 添加您的 LLM API keys。
    * 選擇為不同代理（Navigator、Planner、Validator）使用的模型

4. **升級**：
    * 從 release page 下載最新的 `NB1.zip` 文件。
    * 解壓並用新文件替換您現有的 NB1 文件。
    * 在 Chrome 中前往 `chrome://extensions/` 並點擊 NB1 卡片上的刷新圖標。

## 🛠️ 從原始碼構建

如果您更喜歡自己構建 NB1，請按照以下步驟操作：

1. **先決條件**：
   * [Node.js](https://nodejs.org/)（v22.12.0 或更高版本）
   * [pnpm](https://pnpm.io/installation)（v9.15.1 或更高版本）

2. **克隆倉庫**：
   ```bash
   git clone https://github.com/NB1/NB1.git
   cd NB1
   ```

3. **安裝依賴**：
   ```bash
   pnpm install
   ```

4. **構建擴展程式**：
   ```bash
   pnpm build
   ```

5. **載入擴展程式**：
   * 構建好的擴展程式將位於 `dist` 目錄中
   * 按照手動安裝部分的安裝步驟將擴展程式載入到您的瀏覽器中

6. **開發模式**（可選）：
   ```bash
   pnpm dev
   ```

## 🤖 選擇您的模型

NB1 允許您為每個代理配置不同的 LLM 模型，以平衡性能和成本。以下是推薦的配置：

### 更好的性能
- **Planner 和 Validator**：Claude 3.7 Sonnet
  - 更好的推理和規劃能力
  - 更可靠的任務驗證
- **Navigator**：Claude 3.5 Haiku
  - 高效的網頁導航任務
  - 性能和成本的良好平衡

### 成本效益配置
- **Planner 和 Validator**：Claude Haiku 或 GPT-4o
  - 以較低成本獲得合理性能
  - 複雜任務可能需要更多迭代
- **Navigator**：Gemini 2.0 Flash 或 GPT-4o-mini
  - 輕量且具成本效益
  - 適合基本導航任務

### 本地模型
- **設置選項**：
  - 使用 Ollama 或其他自定義 OpenAI 兼容 providers 在本地運行模型
  - 零 API 成本且完全隱私，所有資料都在您的電腦上

- **推薦模型**：
  - **Falcon3 10B**
  - **Qwen 2.5 Coder 14B**
  - **Mistral Small 24B**
  - 我們歡迎社區在我們的 [Discord](https://discord.gg/NN3ABHggMK) 分享使用其他本地模型的經驗

- **Prompt 工程**：
  - 本地模型需要更具體和更乾淨的 prompts
  - 避免高級、模糊的命令
  - 將複雜任務分解為清晰、詳細的步驟
  - 提供明確的上下文和約束

> **注意**：成本效益配置可能產生較不穩定的輸出，複雜任務可能需要更多迭代。

> **提示**：歡迎嘗試您自己的模型配置！找到了一個很棒的模型組合？在我們的 [Discord](https://discord.gg/NN3ABHggMK) 與社區分享，幫助其他人優化他們的設置。

## 💡 實際應用

以下是您只需一句話就能完成的一些強大任務：

1. **新聞摘要**：
   > "前往 TechCrunch 並幫忙撈過去 24 小時內的前 10 個頭條新聞"

2. **GitHub 研究**：
   > "在 GitHub 上尋找最多星星的熱門 Python 倉庫"

3. **購物研究**：
   > "在 Amazon 上尋找一個具有防水設計的便攜式藍牙音箱，價格低於 50 美元。它應該有至少 10 小時的電池壽命"

## 🛠️ 路線圖

我們正在積極開發 NB1，未來將有令人興奮的功能，歡迎加入我們！

查看我們在 [GitHub Discussions](https://github.com/NB1/NB1/discussions/85) 中的詳細路線圖和即將推出的功能。

## 🤝 貢獻

**我們需要您的幫助使 NB1 變得更好！** 歡迎各種形式的貢獻：

*  **分享 Prompts 和使用案例** 
   * 加入我們的 [Discord](https://discord.gg/NN3ABHggMK)。
   * 分享您如何使用 NB1。幫助我們建立有用 prompts 和真實世界的使用案例。
*  **提供反饋** 
   * 嘗試 NB1 並在我們的 [Discord](https://discord.gg/NN3ABHggMK)中提供關於其效能的反饋或建議改進。
* **貢獻程式碼**
   * 查看我們的 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何為項目貢獻程式碼的指南。
   * 提交 bug 修復、功能或文檔改進的 pull requests。


我們相信開源和社區協作的力量。加入我們，一同構建網頁自動化的未來！


## 🔒 安全

如果您發現安全漏洞，請**不要**通過 issues、pull requests 或討論公開披露。

相反，請創建 [GitHub Security Advisory](https://github.com/NB1/NB1/security/advisories/new) 負責任地報告漏洞。這使我們能夠在公開披露之前解決問題。

感謝您幫助保持 NB1 及其用戶的安全！

## 💬 社區

加入我們不斷成長的開發者和用戶社區：

- [Discord](https://discord.gg/NN3ABHggMK) - 與團隊和社區聊天
- [Twitter](https://x.com/NB1_ai) - 關注更新和公告
- [GitHub Discussions](https://github.com/NB1/NB1/discussions) - 分享想法和提問

## 👏 致謝

NB1 建立在其他優秀的開源項目之上：

- [Browser Use](https://github.com/browser-use/browser-use)
- [Puppeteer](https://github.com/EmergenceAI/Agent-E)
- [Chrome Extension Boilerplate](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite)
- [LangChain](https://github.com/langchain-ai/langchainjs)

非常感謝他們的創建者和貢獻者！


## 📄 許可證

本項目採用 Apache License 2.0 許可證 - 詳情請參閱 [LICENSE](LICENSE) 文件。

由 NB1 團隊用 ❤️ 製作。

喜歡 NB1？給我們一個星星 🌟 並加入我們 [Discord](https://discord.gg/NN3ABHggMK) | [X](https://x.com/NB1_ai)
