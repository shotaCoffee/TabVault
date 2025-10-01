import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveNotionConfig, getNotionConfig, clearNotionConfig } from './storage'
import type { NotionConfig } from '../types'

// Mock chrome.storage.local
const mockStorage: Record<string, unknown> = {}

global.chrome = {
  storage: {
    local: {
      set: vi.fn((items) => {
        Object.assign(mockStorage, items)
        return Promise.resolve()
      }),
      get: vi.fn((key) => {
        if (typeof key === 'string') {
          return Promise.resolve({ [key]: mockStorage[key] })
        }
        return Promise.resolve(mockStorage)
      }),
      remove: vi.fn((key) => {
        if (typeof key === 'string') {
          delete mockStorage[key]
        }
        return Promise.resolve()
      }),
    },
  },
} as unknown as typeof chrome

describe('storage utilities', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
    vi.clearAllMocks()
  })

  describe('saveNotionConfig', () => {
    it('should save notion config to chrome storage', async () => {
      const config: NotionConfig = {
        token: 'test-token',
        databaseId: 'test-db-id',
      }

      await saveNotionConfig(config)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        notionConfig: config,
      })
      expect(mockStorage.notionConfig).toEqual(config)
    })
  })

  describe('getNotionConfig', () => {
    it('should return notion config from chrome storage', async () => {
      const config: NotionConfig = {
        token: 'test-token',
        databaseId: 'test-db-id',
      }
      mockStorage.notionConfig = config

      const result = await getNotionConfig()

      expect(chrome.storage.local.get).toHaveBeenCalledWith('notionConfig')
      expect(result).toEqual(config)
    })

    it('should return null when config does not exist', async () => {
      const result = await getNotionConfig()

      expect(result).toBeNull()
    })
  })

  describe('clearNotionConfig', () => {
    it('should remove notion config from chrome storage', async () => {
      mockStorage.notionConfig = {
        token: 'test-token',
        databaseId: 'test-db-id',
      }

      await clearNotionConfig()

      expect(chrome.storage.local.remove).toHaveBeenCalledWith('notionConfig')
      expect(mockStorage.notionConfig).toBeUndefined()
    })
  })
})
