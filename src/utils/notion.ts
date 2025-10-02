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
  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
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
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'API Error')
    }
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
