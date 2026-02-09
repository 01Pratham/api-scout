import type { RequestItem } from '../../types'

/**
 * Save a new request
 */
export const saveRequest = async (
    name: string,
    method: string,
    url: string,
    headers: Record<string, string>,
    body: string | undefined,
    collectionId: string,
    preRequestScript?: string,
    postRequestScript?: string
): Promise<{ success: boolean; error?: string }> => {
    if (!collectionId || !name.trim()) {
        return { success: false, error: 'Collection and request name are required' }
    }

    try {
        const res = await fetch('__api__/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                method,
                url,
                headers: JSON.stringify(headers),
                body: body ?? undefined,
                collectionId,
                preRequestScript,
                postRequestScript,
            }),
        })

        if (res.ok) {
            return { success: true }
        }
        const data = (await res.json()) as { error?: string }
        return { success: false, error: data.error ?? 'Failed to save request' }
    } catch {
        return { success: false, error: 'Failed to save request' }
    }
}

/**
 * Update an existing request
 */
export const updateRequest = async (
    requestId: string,
    name: string,
    method: string,
    url: string,
    headers: Record<string, string>,
    body: string | undefined,
    expectedUpdatedAt: string | null,
    forceOverwrite = false,
    preRequestScript?: string,
    postRequestScript?: string
): Promise<{ success: boolean; error?: string; conflict?: boolean; serverVersion?: RequestItem }> => {
    try {
        const res = await fetch(`__api__/requests/${requestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                method,
                url,
                headers: JSON.stringify(headers),
                body: body ?? undefined,
                expectedUpdatedAt,
                forceOverwrite,
                preRequestScript,
                postRequestScript,
            }),
        })

        const data = (await res.json()) as { conflict?: boolean; serverVersion?: RequestItem; error?: string }

        if (res.status === 409 && data.conflict) {
            // Conflict detected
            return {
                success: false,
                conflict: true,
                serverVersion: data.serverVersion,
            }
        }

        if (res.ok) {
            return { success: true }
        }

        return { success: false, error: data.error ?? 'Update failed' }
    } catch {
        return { success: false, error: 'Failed to update request' }
    }
}

/**
 * Delete a request
 */
export const deleteRequest = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const res = await fetch(`__api__/requests/${id}`, { method: 'DELETE' })
        if (res.ok) {
            return { success: true }
        }
        return { success: false, error: 'Failed to delete request' }
    } catch {
        return { success: false, error: 'Failed to delete request' }
    }
}

/**
 * Parse headers from JSON string to array format
 */
export const parseHeadersToArray = (headersJson: string): Array<{ key: string; value: string }> => {
    try {
        const parsed = JSON.parse(headersJson) as Record<string, string>
        const headerArray = Object.entries(parsed).map(([key, value]) => ({
            key,
            value: String(value),
        }))
        return headerArray.length > 0 ? headerArray : [{ key: '', value: '' }]
    } catch {
        return [{ key: '', value: '' }]
    }
}
