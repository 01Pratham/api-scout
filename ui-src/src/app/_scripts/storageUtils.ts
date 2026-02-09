import type { RequestTab } from '../../types'

/**
 * Create a new empty tab
 */
export const createNewTab = (): RequestTab => ({
    id: `tab-${Date.now()}`,
    name: 'New Request',
    method: 'GET',
    url: '',
    headers: [{ key: '', value: '' }],
    body: '',
    bodyType: 'json',
    formData: [{ key: '', value: '', type: 'text', file: null }],
    response: null,
    executing: false,
    savedRequestId: null,
    serverUpdatedAt: null,
})

/**
 * Load tabs from localStorage
 */
export const loadTabsFromStorage = (): {
    tabs: RequestTab[]
    activeTabId: string
} | null => {
    try {
        const savedTabs = localStorage.getItem('api-tester-tabs')
        const savedActiveTab = localStorage.getItem('api-tester-active-tab')

        if (savedTabs) {
            const parsed = JSON.parse(savedTabs) as RequestTab[]
            if (Array.isArray(parsed) && parsed.length > 0) {
                const restoredTabs = parsed.map((tab: RequestTab) => ({
                    ...tab,
                    formData:
                        tab.formData?.map(f => ({ ...f, file: null })) ?? [
                            { key: '', value: '', type: 'text' as const, file: null },
                        ],
                    executing: false,
                }))
                return {
                    tabs: restoredTabs,
                    activeTabId: savedActiveTab ?? restoredTabs[0]?.id ?? '',
                }
            }
        }
    } catch (e) {
        console.error('Failed to load tabs from storage:', e)
    }
    return null
}

/**
 * Save tabs to localStorage
 */
export const saveTabsToStorage = (tabs: RequestTab[], activeTabId: string): void => {
    try {
        const tabsToSave = tabs.map(tab => ({
            ...tab,
            formData: tab.formData.map(f => ({ ...f, file: null })),
            response: null,
        }))
        localStorage.setItem('api-tester-tabs', JSON.stringify(tabsToSave))
        localStorage.setItem('api-tester-active-tab', activeTabId)
    } catch (e) {
        console.error('Failed to save tabs to storage:', e)
    }
}

/**
 * Load settings from localStorage
 */
export const loadSettingsFromStorage = <T>(key: string, defaultSettings: T): T => {
    if (typeof window === 'undefined') { return defaultSettings }
    try {
        const saved = localStorage.getItem(key)
        if (saved) { return { ...defaultSettings, ...(JSON.parse(saved) as Record<string, unknown>) as T } }
    } catch {
        /* use defaults */
    }
    return defaultSettings
}

/**
 * Save settings to localStorage
 */
export const saveSettingsToStorage = <T>(key: string, settings: T): void => {
    if (typeof window === 'undefined') { return }
    localStorage.setItem(key, JSON.stringify(settings))
}
