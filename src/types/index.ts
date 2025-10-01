// タブ情報
export interface TabInfo {
  id?: number
  title: string
  url: string
  favIconUrl?: string
}

// Notion設定
export interface NotionConfig {
  token: string
  databaseId: string
}

// 保存ステータス
export type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

// エラー型
export interface AppError {
  message: string
  code?: string
}
