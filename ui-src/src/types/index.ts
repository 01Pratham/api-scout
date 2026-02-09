
/**
 * Represents a JSON-serializable value
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export const METHOD_COLORS: Record<string, string> = {
    GET: 'green',
    POST: 'blue',
    PUT: 'orange',
    PATCH: 'purple',
    DELETE: 'red',
}

export interface RequestItem {
    id: string
    name: string
    method: string
    url: string
    headers: string
    body: string | null
    updatedAt?: string // Added to match backend response
    preRequestScript?: string
    postRequestScript?: string
}

export interface Folder {
    id: string
    name: string
    requests: RequestItem[]
    folders: Folder[]
    headers?: string
}

export interface Collection {
    id: string
    name: string
    requests: RequestItem[]
    folders?: Folder[]
    headers?: string
}

export interface Environment {
    id: string
    name: string
    variables: string
}

export interface ExecuteResponse {
    success: boolean
    status?: number
    statusText?: string
    headers?: Record<string, string>
    cookies?: string[]
    body?: string | JsonValue
    time?: number
    error?: string
}

export interface HistoryItem {
    id: string
    method: string
    url: string
    status: number | null
    statusText: string | null
    duration: number | null
    error: string | null
    createdAt: string
    requestHeaders?: string
    requestBody?: string
}

export interface RequestTab {
    id: string
    name: string
    method: string
    url: string
    headers: Array<{ key: string; value: string }>
    body: string
    bodyType: 'json' | 'form-data'
    formData: Array<{ key: string; value: string; type: 'text' | 'file'; file: File | null }>
    response: ExecuteResponse | null
    executing: boolean
    savedRequestId: string | null
    serverUpdatedAt: string | null
    preRequestScript?: string
    postRequestScript?: string
}

export interface ConflictData {
    requestId: string
    serverVersion: RequestItem
}

export interface RequestSettings {
    sslVerification: boolean
    followRedirects: boolean
    timeout: number
    maxResponseSize: number
}

export interface Cookie {
    name: string
    value: string
    domain?: string
    path?: string
    expires?: string
    httpOnly?: boolean
    secure?: boolean
}

export interface OpenApiServer {
    url: string
    description?: string
}

export interface OpenApiInfo {
    title: string
    version: string
}

export interface OpenApiOperation {
    summary?: string
    description?: string
    requestBody?: {
        content?: {
            'application/json'?: {
                example?: JsonValue
                schema?: JsonValue
            }
        }
    }
}

export interface OpenApiPaths {
    [path: string]: {
        [method: string]: OpenApiOperation
    }
}

export interface OpenApiSpec {
    openapi?: string
    info?: OpenApiInfo
    servers?: OpenApiServer[]
    paths?: OpenApiPaths
}

