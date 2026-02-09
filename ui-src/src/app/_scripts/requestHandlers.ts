import type { ExecuteResponse, RequestSettings, JsonValue } from '../../types'

/**
 * Normalize URL - add protocol if missing
 */
export const normalizeUrl = (inputUrl: string): string => {
    const trimmed = inputUrl.trim()
    if (!trimmed) { return trimmed }

    // If it starts with {{ (variable) or / (relative), don't prepend https://
    if (trimmed.startsWith('{{') || trimmed.startsWith('/')) {
        return trimmed
    }

    // Already has protocol
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed
    }

    // Has other protocol (ftp, ws, etc.)
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
        return trimmed
    }

    // Default to http:// for local tester if no protocol
    return `http://${trimmed}`
}

/**
 * Parse headers from array to object
 */
export const parseHeaders = (headers: Array<{ key: string; value: string }>): Record<string, string> => {
    const result: Record<string, string> = {}
    headers.forEach(({ key, value }) => {
        if (key.trim()) {
            result[key.trim()] = value
        }
    })
    return result
}

/**
 * Execute HTTP request
 */
export const executeHttpRequest = async (
    method: string,
    url: string,
    headers: Array<{ key: string; value: string }>,
    body: string,
    bodyType: 'json' | 'form-data',
    formData: Array<{ key: string; value: string; type: 'text' | 'file'; file: File | null }>,
    settings: RequestSettings,
    selectedEnvId: string,
    variables?: Record<string, string>
): Promise<ExecuteResponse> => {
    const normalizedUrl = normalizeUrl(url)

    try {
        let res: Response

        if (bodyType === 'form-data') {
            // Build FormData for multipart request
            const formDataPayload = new FormData()
            formDataPayload.append('_method', method)
            formDataPayload.append('_url', normalizedUrl)
            formDataPayload.append('_headers', JSON.stringify(parseHeaders(headers)))
            formDataPayload.append('_settings', JSON.stringify(settings))
            if (selectedEnvId) {
                formDataPayload.append('_environmentId', selectedEnvId)
            }

            // Add form fields
            for (const field of formData) {
                if (!field.key) { continue }
                if (field.type === 'file' && field.file) {
                    formDataPayload.append(field.key, field.file)
                } else if (field.type === 'text' && field.value) {
                    formDataPayload.append(field.key, field.value)
                }
            }

            res = await fetch('__api__/execute-formdata', {
                method: 'POST',
                body: formDataPayload,
            })
        } else {
            // JSON body request
            res = await fetch('__api__/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    method,
                    url: normalizedUrl,
                    headers: parseHeaders(headers),
                    body: body || undefined,
                    environmentId: selectedEnvId || undefined,
                    variables,
                    ...settings,
                    timeout: (settings.timeout ?? 30) * 1000,
                }),
            })
        }

        const data = (await res.json()) as ExecuteResponse
        return data
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to execute request',
        }
    }
}

/**
 * Format response body for display
 */
export const formatResponseBody = (body: string | JsonValue | null | undefined): string => {
    if (typeof body === 'undefined') { return '' }
    if (body === null) { return '' }
    if (typeof body === 'string') { return body }
    try {
        return JSON.stringify(body, null, 2)
    } catch {
        return String(body)
    }
}

/**
 * Check if response is HTML
 */
export const isHtmlResponse = (headers?: Record<string, string>): boolean => {
    if (!headers) { return false }
    const contentType = (headers['content-type'] ?? headers['Content-Type']) ?? ''
    return contentType.includes('text/html')
}

/**
 * Check if response is JSON
 */
export const isJsonResponse = (body: string | JsonValue | null | undefined): boolean => {
    if (typeof body === 'undefined' || body === null) { return false }
    if (typeof body === 'object') { return true }
    if (typeof body === 'string') {
        try {
            JSON.parse(body)
            return true
        } catch {
            return false
        }
    }
    return false
}
