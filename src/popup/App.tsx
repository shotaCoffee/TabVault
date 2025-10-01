import { useState, useEffect } from 'react'
import type { TabInfo, NotionConfig, SaveStatus } from '../types'
import { getNotionConfig, saveNotionConfig } from '../utils/storage'
import { saveMultipleTabs } from '../utils/notion'

function App() {
  const [tabs, setTabs] = useState<TabInfo[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [message, setMessage] = useState<string>('')
  const [config, setConfig] = useState<NotionConfig | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [databaseIdInput, setDatabaseIdInput] = useState('')

  useEffect(() => {
    // 設定を読み込む
    getNotionConfig().then((savedConfig) => {
      if (savedConfig) {
        setConfig(savedConfig)
        setTokenInput(savedConfig.token)
        setDatabaseIdInput(savedConfig.databaseId)
      }
    })

    // 現在のタブを取得
    chrome.tabs.query({ currentWindow: true }, (chromeTabs) => {
      const tabInfos: TabInfo[] = chromeTabs.map((tab) => ({
        id: tab.id,
        title: tab.title || 'Untitled',
        url: tab.url || '',
        favIconUrl: tab.favIconUrl,
      }))
      setTabs(tabInfos)
    })
  }, [])

  const handleSave = async () => {
    if (!config) {
      setMessage('❌ Notion設定が必要です')
      return
    }

    setStatus('saving')
    setMessage('保存中...')

    try {
      const result = await saveMultipleTabs({
        tabs,
        token: config.token,
        databaseId: config.databaseId,
      })

      setStatus('success')
      setMessage(`✅ ${result.success}個のタブを保存しました`)

      if (result.failed > 0) {
        setMessage((prev) => prev + ` (${result.failed}個失敗)`)
      }
    } catch (error) {
      setStatus('error')
      setMessage('❌ 保存に失敗しました')
      console.error(error)
    }

    // 3秒後にメッセージをクリア
    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 3000)
  }

  const handleSaveSettings = async () => {
    if (!tokenInput.trim() || !databaseIdInput.trim()) {
      return
    }

    const newConfig: NotionConfig = {
      token: tokenInput.trim(),
      databaseId: databaseIdInput.trim(),
    }

    await saveNotionConfig(newConfig)
    setConfig(newConfig)
    setShowSettings(false)
  }

  const handleOpenSettings = () => {
    setShowSettings(true)
  }

  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  return (
    <div className="app">
      <header>
        <h1>TabVault</h1>
      </header>

      <div className="content">
        <div className="tab-count">
          📊 現在のタブ: <strong>{tabs.length}個</strong>
        </div>

        {!config && <div className="warning">⚠️ Notion設定が必要です</div>}

        <button
          onClick={handleSave}
          disabled={status === 'saving' || !config}
          className={`save-button ${status}`}
        >
          {status === 'saving' ? '保存中...' : '💾 全て保存する'}
        </button>

        {message && <div className={`message ${status}`}>{message}</div>}
      </div>

      <footer>
        <button className="settings-button" onClick={handleOpenSettings}>
          ⚙️ 設定
        </button>
      </footer>

      {showSettings && (
        <div className="modal-overlay" onClick={handleCloseSettings}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Notion設定</h2>
            <div className="form-group">
              <label htmlFor="token">Integration Token</label>
              <input
                id="token"
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="secret_xxxxx..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="databaseId">Database ID</label>
              <input
                id="databaseId"
                type="text"
                value={databaseIdInput}
                onChange={(e) => setDatabaseIdInput(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <div className="modal-buttons">
              <button
                className="button-secondary"
                onClick={handleCloseSettings}
              >
                キャンセル
              </button>
              <button className="button-primary" onClick={handleSaveSettings}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
