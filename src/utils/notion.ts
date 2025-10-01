import { Client } from '@notionhq/client'
import type { TabInfo } from '../types'

interface SaveTabParams {
  tab: TabInfo
  token: string
  databaseId: string
}

export async function saveTabToNotion({
  tab,
  token,
  databaseId,
}: SaveTabParams): Promise<void> {
  const notion = new Client({ auth: token })

  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Title: {
          title: [{ text: { content: tab.title } }],
        },
        URL: {
          url: tab.url,
        },
        'Saved Date': {
          date: { start: new Date().toISOString() },
        },
      },
    })
  } catch (error) {
    console.error('Failed to save tab to Notion:', error)
    throw new Error('Notionへの保存に失敗しました')
  }
}

export async function saveMultipleTabs({
  tabs,
  token,
  databaseId,
}: {
  tabs: TabInfo[]
  token: string
  databaseId: string
}): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  // 並列実行（最大5つずつ）
  const chunks = []
  for (let i = 0; i < tabs.length; i += 5) {
    chunks.push(tabs.slice(i, i + 5))
  }

  for (const chunk of chunks) {
    const results = await Promise.allSettled(
      chunk.map((tab) => saveTabToNotion({ tab, token, databaseId }))
    )

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        success++
      } else {
        failed++
      }
    })
  }

  return { success, failed }
}
