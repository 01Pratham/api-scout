import type { JsonValue } from '../../types'

/**
 * Import Postman collection from file
 */
export const importPostmanCollection = async (
    file: File
): Promise<{ success: boolean; error?: string; collection?: { name: string }; requestsImported?: number }> => {
    try {
        const text = await file.text()
        const jsonData = JSON.parse(text) as JsonValue

        const res = await fetch('__api__/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: jsonData }),
        })

        const result = (await res.json()) as { success: boolean; error?: string; collection?: { name: string }; requestsImported?: number }
        if (result.success) {
            return {
                success: true,
                collection: result.collection,
                requestsImported: result.requestsImported,
            }
        } else {
            return { success: false, error: result.error }
        }
    } catch {
        return { success: false, error: 'Invalid Postman collection file' }
    }
}

/**
 * Export OpenAPI spec for a collection
 */
export const exportOpenApiSpec = async (
    collectionId: string,
    collectionName: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const res = await fetch(`__api__/export-openapi/${collectionId}`)
        const data = (await res.json()) as JsonValue
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${collectionName}-openapi.json`
        a.click()
        URL.revokeObjectURL(url)
        return { success: true }
    } catch {
        return { success: false, error: 'Failed to export OpenAPI spec' }
    }
}

/**
 * Load OpenAPI documentation for a collection
 */
export const loadOpenApiDocs = async (
    collectionId: string
): Promise<{ success: boolean; error?: string; spec?: JsonValue }> => {
    try {
        const res = await fetch(`__api__/export-openapi/${collectionId}`)
        if (!res.ok) { throw new Error('Failed to load') }
        const data = (await res.json()) as JsonValue
        return { success: true, spec: data }
    } catch {
        return { success: false, error: 'Failed to load API documentation' }
    }
}

/**
 * Export Postman Collection
 */
export const exportPostmanCollection = async (
    collectionId: string,
    collectionName: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const res = await fetch(`__api__/export-postman/${collectionId}`)
        if (!res.ok) { throw new Error('Failed to export') }
        const data = (await res.json()) as JsonValue
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${collectionName}-postman.json`
        a.click()
        URL.revokeObjectURL(url)
        return { success: true }
    } catch {
        return { success: false, error: 'Failed to export Postman collection' }
    }
}
