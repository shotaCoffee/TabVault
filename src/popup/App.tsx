import { useState, useEffect } from 'react'
import type { TabInfo, NotionConfig, SaveStatus } from '../types'
import { getNotionConfig } from '../utils/storage'
import { saveMultipleTabs } from '../utils/notion'

function App() {
  const [tabs, setTabs] = useState<TabInfo[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [message, setMessage] = useState<string>('')
  const [config, setConfig] = useState<NotionConfig | null>(null)

  useEffect(() => {
    // 設定を読み込む
    getNotionConfig().then(setConfig)

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
        <button className="settings-button">⚙️ 設定</button>
      </footer>
    </div>
  )
}

export default App
