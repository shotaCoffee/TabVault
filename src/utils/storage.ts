import type { NotionConfig } from '../types'

const STORAGE_KEY = 'notionConfig'

export async function saveNotionConfig(config: NotionConfig): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: config })
}

export async function getNotionConfig(): Promise<NotionConfig | null> {
  const result = await chrome.storage.local.get(STORAGE_KEY)
  return result[STORAGE_KEY] || null
}

export async function clearNotionConfig(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY)
}
