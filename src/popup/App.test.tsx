import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock chrome API
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
  tabs: {
    query: vi.fn((_queryInfo, callback) => {
      callback([
        {
          id: 1,
          title: 'Test Tab 1',
          url: 'https://example1.com',
          favIconUrl: 'https://example1.com/favicon.ico',
        },
        {
          id: 2,
          title: 'Test Tab 2',
          url: 'https://example2.com',
        },
      ])
    }),
  },
  runtime: {
    sendMessage: vi.fn(() =>
      Promise.resolve({ success: true, result: { success: 2, failed: 0 } })
    ),
  },
} as unknown as typeof chrome

describe('App', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
    vi.clearAllMocks()
  })

  it('should render app with tab count', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/現在のタブ:/)).toBeInTheDocument()
      expect(screen.getByText('2個')).toBeInTheDocument()
    })
  })

  it('should show warning when no config is set', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/Notion設定が必要です/)).toBeInTheDocument()
    })
  })

  it('should open settings modal when settings button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    const settingsButton = await screen.findByRole('button', {
      name: /設定/,
    })
    await user.click(settingsButton)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Notion設定/ })
      ).toBeInTheDocument()
    })
  })

  it('should save settings and close modal', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Open settings
    const settingsButton = await screen.findByRole('button', {
      name: /設定/,
    })
    await user.click(settingsButton)

    // Fill in form
    const tokenInput = screen.getByLabelText(/Integration Token/)
    const databaseIdInput = screen.getByLabelText(/Database ID/)

    await user.type(tokenInput, 'test-token-123')
    await user.type(databaseIdInput, 'test-db-id-456')

    // Save
    const saveButton = screen.getByRole('button', { name: '保存' })
    await user.click(saveButton)

    // Check settings were saved
    await waitFor(() => {
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        notionConfig: {
          token: 'test-token-123',
          databaseId: 'test-db-id-456',
        },
      })
    })

    // Modal should be closed
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /Notion設定/ })
      ).not.toBeInTheDocument()
    })
  })

  it('should not save settings if form is incomplete', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Open settings
    const settingsButton = await screen.findByRole('button', {
      name: /設定/,
    })
    await user.click(settingsButton)

    // Try to save without filling form
    const saveButton = screen.getByRole('button', { name: '保存' })
    await user.click(saveButton)

    // Settings should not be saved
    expect(chrome.storage.local.set).not.toHaveBeenCalled()
  })

  it('should enable save button when config is set', async () => {
    mockStorage.notionConfig = {
      token: 'test-token',
      databaseId: 'test-db-id',
    }

    render(<App />)

    await waitFor(() => {
      const saveButton = screen.getByRole('button', {
        name: /全て保存する/,
      })
      expect(saveButton).not.toBeDisabled()
    })
  })
})
