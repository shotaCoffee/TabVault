// 拡張機能のインストール時
chrome.runtime.onInstalled.addListener(() => {
  console.log('TabVault installed')
})

// 将来の機能用のメッセージリスナー
chrome.runtime.onMessage.addListener((message) => {
  console.log('Received message:', message)
  // 自動保存などの機能を追加する際に使用
  return true
})

export {}
