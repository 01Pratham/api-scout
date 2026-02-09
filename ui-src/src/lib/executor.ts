import https from 'https'

import axios, { AxiosError } from 'axios'

import type { AxiosRequestConfig, Method } from 'axios'

/**
 * Represents a JSON-serializable value
 */
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface ExecuteRequest {
    method: string
    url: string
    headers?: Record<string, string>
    body?: string
    timeout?: number
    sslVerification?: boolean
    followRedirects?: boolean
    maxResponseSize?: number
}

export interface ExecuteResponse {
    success: boolean
    status?: number
    statusText?: string
    headers?: Record<string, string>
    cookies?: string[] // Raw set-cookie headers
    body?: string | JsonValue
    time?: number
    error?: string
}

/**
 * Handle axios error to response object
 */
function handleAxiosError(error: AxiosError, startTime: number, timeout?: number): ExecuteResponse {
    const endTime = Date.now()
    if (error.code === 'ECONNABORTED') {
        return {
            success: false,
            error: `Request timeout after ${timeout ?? 30000}ms`,
            time: endTime - startTime,
        }
    }

    if (error.code === 'ENOTFOUND') {
        return {
            success: false,
            error: `DNS lookup failed`,
            time: endTime - startTime,
        }
    }

    if (error.code === 'ECONNREFUSED') {
        return {
            success: false,
            error: `Connection refused`,
            time: endTime - startTime,
        }
    }

    return {
        success: false,
        error: error.message,
        time: endTime - startTime,
    }
}

export async function executeRequest(request: ExecuteRequest): Promise<ExecuteResponse> {
    const startTime = Date.now()

    try {
        const config: AxiosRequestConfig = {
            method: request.method.toUpperCase() as Method,
            url: request.url,
            headers: request.headers ?? {},
            timeout: request.timeout ?? 30000,
            validateStatus: (): boolean => true, // Accept any status code
            maxRedirects: request.followRedirects === false ? 0 : 5,
            maxContentLength: request.maxResponseSize ? request.maxResponseSize * 1024 * 1024 : Infinity,
            maxBodyLength: request.maxResponseSize ? request.maxResponseSize * 1024 * 1024 : Infinity,
            httpsAgent: new https.Agent({
                rejectUnauthorized: request.sslVerification !== false
            })
        }

        // Add body for methods that support it
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method as string) && request.body) {
            try {
                config.data = JSON.parse(request.body) as JsonValue
                const headers = (config.headers as Record<string, string>) ?? {}
                if (!headers['Content-Type']) {
                    headers['Content-Type'] = 'application/json'
                }
                config.headers = headers
            } catch {
                // If not valid JSON, send as raw string
                config.data = request.body
            }
        }

        // Automatically set Host header
        if (request.url.includes('host.docker.internal')) {
            const headers = (config.headers as Record<string, string>) ?? {}
            if (!headers['Host']) {
                headers['Host'] = 'localhost'
            }
            config.headers = headers
        }

        const response = await axios(config)
        const endTime = Date.now()

        // Convert headers to simple object
        const responseHeaders: Record<string, string> = {}
        Object.entries(response.headers).forEach(([key, value]) => {
            if (key.toLowerCase() === 'set-cookie') { return } // Skip cookies in main headers

            if (typeof value === 'string') {
                responseHeaders[key] = value
            } else if (Array.isArray(value)) {
                responseHeaders[key] = value.join(', ')
            }
        })

        // Extract cookies specifically
        let cookies: string[] = []
        const setCookie = response.headers['set-cookie']
        if (setCookie) {
            if (Array.isArray(setCookie)) {
                cookies = setCookie
            } else if (typeof setCookie === 'string') {
                cookies = [setCookie]
            }
        }

        return {
            success: true,
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            cookies,
            body: response.data as JsonValue,
            time: endTime - startTime,
        }
    } catch (error) {
        const endTime = Date.now()

        if (error instanceof AxiosError) {
            return handleAxiosError(error, startTime, request.timeout)
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            time: endTime - startTime,
        }
    }
}
