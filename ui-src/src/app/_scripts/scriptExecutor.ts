import type { ExecuteResponse, JsonValue } from '../../types';

export interface ScriptContext {
    environment: Record<string, string>
    request: {
        url: string
        method: string
        headers: Record<string, string>
        body: string
    }
}

/**
 * Execute a pre-request script
 */
export const runPreRequestScript = (
    script: string,
    context: ScriptContext
): { success: boolean; error?: string; context: ScriptContext } => {
    if (!script?.trim()) { return { success: true, context } }

    const { environment, request } = context
    // Clone to avoid mutation if error
    const localEnv = { ...environment }
    const localReq = { ...request, headers: { ...request.headers } }

    try {
        const pm = {
            environment: {
                set: (key: string, value: string): void => { localEnv[key] = value },
                get: (key: string): string | undefined => localEnv[key],
                unset: (key: string): void => { delete localEnv[key] },
            },
            request: {
                ...localReq,
                headers: {
                    add: (key: string, value: string): void => { localReq.headers[key] = value },
                    // Access via simple object too?
                    get: (key: string): string | undefined => localReq.headers[key],
                    ...localReq.headers
                },
                body: {
                    update: (content: string): void => { localReq.body = content }
                }
            },
            variables: {
                set: (key: string, value: string): void => { localEnv[key] = value },
                get: (key: string): string | undefined => localEnv[key]
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const func = new Function('pm', script)
        func(pm)

        return {
            success: true,
            context: { environment: localEnv, request: localReq }
        }
    } catch (e) {
        return { success: false, error: (e as Error).message, context }
    }
}

/**
 * Execute a post-request script (tests)
 */
export const runPostRequestScript = (
    script: string,
    environment: Record<string, string>,
    response: ExecuteResponse
): { success: boolean; error?: string; environment: Record<string, string>; tests: Record<string, boolean> } => {
    if (!script?.trim()) { return { success: true, environment, tests: {} } }

    const localEnv = { ...environment }
    const tests: Record<string, boolean> = {}

    try {
        const pm = {
            environment: {
                set: (key: string, value: string): void => { localEnv[key] = value },
                get: (key: string): string | undefined => localEnv[key],
                unset: (key: string): void => { delete localEnv[key] },
            },
            response: {
                code: response.status,
                status: response.statusText,
                headers: response.headers,
                responseTime: response.time,
                text: (): string => typeof response.body === 'string' ? response.body : JSON.stringify(response.body),
                json: (): JsonValue | null => {
                    if (typeof response.body === 'object' && response.body !== null) { return response.body as JsonValue }
                    try { return JSON.parse(String(response.body)) as JsonValue } catch { return null }
                },
                to: {
                    have: {
                        status: (code: number): void => {
                            if (response.status !== code) { throw new Error(`Expected status ${code} but got ${response.status}`) }
                        },
                        jsonBody: (_key: string): void => {
                            // Simple check
                            const body = response.body;
                            const json = (typeof body === 'object' && body !== null) ? body : JSON.parse(String(response.body)) as JsonValue;
                            if (!json || typeof json !== 'object') { throw new Error('Body is not JSON'); }
                        }
                    }
                }
            },
            test: (name: string, fn: () => void): void => {
                try {
                    fn()
                    tests[name] = true
                } catch {
                    tests[name] = false
                }
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const func = new Function('pm', script)
        func(pm)

        return { success: true, environment: localEnv, tests }
    } catch (e) {
        return { success: false, error: (e as Error).message, environment, tests }
    }
}
