import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveTabToNotion, saveMultipleTabs } from './notion'
import type { TabInfo } from '../types'

// Mock global fetch
global.fetch = vi.fn()

describe('notion utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('saveTabToNotion', () => {
    it('should save a single tab to Notion', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-id' }),
      })
      global.fetch = mockFetch

      const tab: TabInfo = {
        id: 1,
        title: 'Test Page',
        url: 'https://example.com',
        favIconUrl: 'https://example.com/favicon.ico',
      }

      await saveTabToNotion({
        tab,
        token: 'test-token',
        databaseId: 'test-db-id',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.notion.com/v1/pages',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
        })
      )
    })

    it('should throw error when save fails', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'API Error' }),
      })
      global.fetch = mockFetch

      const tab: TabInfo = {
        title: 'Test Page',
        url: 'https://example.com',
      }

      await expect(
        saveTabToNotion({
          tab,
          token: 'test-token',
          databaseId: 'test-db-id',
        })
      ).rejects.toThrow('Notionへの保存に失敗しました')
    })
  })

  describe('saveMultipleTabs', () => {
    it('should save multiple tabs and return success count', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-id' }),
      })
      global.fetch = mockFetch

      const tabs: TabInfo[] = [
        { title: 'Page 1', url: 'https://example1.com' },
        { title: 'Page 2', url: 'https://example2.com' },
        { title: 'Page 3', url: 'https://example3.com' },
      ]

      const result = await saveMultipleTabs({
        tabs,
        token: 'test-token',
        databaseId: 'test-db-id',
      })

      expect(result).toEqual({ success: 3, failed: 0 })
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should handle partial failures', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'page-1' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Failed' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'page-3' }),
        })
      global.fetch = mockFetch

      const tabs: TabInfo[] = [
        { title: 'Page 1', url: 'https://example1.com' },
        { title: 'Page 2', url: 'https://example2.com' },
        { title: 'Page 3', url: 'https://example3.com' },
      ]

      const result = await saveMultipleTabs({
        tabs,
        token: 'test-token',
        databaseId: 'test-db-id',
      })

      expect(result).toEqual({ success: 2, failed: 1 })
    })

    it('should process tabs in chunks of 5', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-id' }),
      })
      global.fetch = mockFetch

      const tabs: TabInfo[] = Array.from({ length: 12 }, (_, i) => ({
        title: `Page ${i + 1}`,
        url: `https://example${i + 1}.com`,
      }))

      const result = await saveMultipleTabs({
        tabs,
        token: 'test-token',
        databaseId: 'test-db-id',
      })

      expect(result).toEqual({ success: 12, failed: 0 })
      expect(mockFetch).toHaveBeenCalledTimes(12)
    })
  })
})
