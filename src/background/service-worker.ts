import { saveMultipleTabs } from '../utils/notion'
import type { TabInfo } from '../types'

chrome.runtime.onInstalled.addListener(() => {
  console.log('TabVault installed')
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SAVE_TABS') {
    const { tabs, token, databaseId } = message.payload as {
      tabs: TabInfo[]
      token: string
      databaseId: string
    }

    saveMultipleTabs({ tabs, token, databaseId })
      .then((result) => {
        sendResponse({ success: true, result })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })

    return true // 非同期レスポンスを有効化
  }
})

export {}
