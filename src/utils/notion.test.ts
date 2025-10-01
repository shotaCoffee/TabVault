import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveTabToNotion, saveMultipleTabs } from './notion'
import type { TabInfo } from '../types'

// Mock @notionhq/client
vi.mock('@notionhq/client', () => {
  const mockCreate = vi.fn()
  return {
    Client: vi.fn(() => ({
      pages: {
        create: mockCreate,
      },
    })),
    mockCreate,
  }
})

describe('notion utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('saveTabToNotion', () => {
    it('should save a single tab to Notion', async () => {
      const { Client } = await import('@notionhq/client')
      const mockCreate = vi.fn().mockResolvedValue({ id: 'page-id' })
      ;(Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          pages: { create: mockCreate },
        })
      )

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

      expect(mockCreate).toHaveBeenCalledWith({
        parent: { database_id: 'test-db-id' },
        properties: {
          Title: {
            title: [{ text: { content: 'Test Page' } }],
          },
          URL: {
            url: 'https://example.com',
          },
          'Saved Date': {
            date: { start: expect.any(String) },
          },
        },
      })
    })

    it('should throw error when save fails', async () => {
      const { Client } = await import('@notionhq/client')
      const mockCreate = vi.fn().mockRejectedValue(new Error('API Error'))
      ;(Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          pages: { create: mockCreate },
        })
      )

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
      const { Client } = await import('@notionhq/client')
      const mockCreate = vi.fn().mockResolvedValue({ id: 'page-id' })
      ;(Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          pages: { create: mockCreate },
        })
      )

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
      expect(mockCreate).toHaveBeenCalledTimes(3)
    })

    it('should handle partial failures', async () => {
      const { Client } = await import('@notionhq/client')
      const mockCreate = vi
        .fn()
        .mockResolvedValueOnce({ id: 'page-1' })
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({ id: 'page-3' })
      ;(Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          pages: { create: mockCreate },
        })
      )

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
      const { Client } = await import('@notionhq/client')
      const mockCreate = vi.fn().mockResolvedValue({ id: 'page-id' })
      ;(Client as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          pages: { create: mockCreate },
        })
      )

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
      expect(mockCreate).toHaveBeenCalledTimes(12)
    })
  })
})
