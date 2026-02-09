export interface AppSettings {
    ignoreSegments: string[];
}

/**
 * Fetch app-wide settings from the server
 */
export const fetchAppSettings = async (): Promise<AppSettings> => {
    try {
        const res = await fetch('__api__/settings')
        if (res.ok) {
            return (await res.json()) as AppSettings
        }
    } catch (error) {
        console.error('Failed to fetch app settings:', error)
    }
    return { ignoreSegments: ['api', 'v1'] }
}
