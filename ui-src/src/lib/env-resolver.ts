export interface EnvironmentVariables {
    [key: string]: string
}

/**
 * Resolves environment variables in a string.
 * Variables are in the format {{VARIABLE_NAME}}
 */
export function resolveVariables(
    input: string,
    variables: EnvironmentVariables
): string {
    if (!input) { return input }

    return input.replace(/\{\{([^}]+)\}\}/g, (match: string, varName: string) => {
        const trimmedName = varName.trim()
        return variables[trimmedName] ?? match
    })
}

/**
 * Resolves variables in headers object
 */
export function resolveHeaderVariables(
    headers: Record<string, string>,
    variables: EnvironmentVariables
): Record<string, string> {
    const resolved: Record<string, string> = {}

    for (const [key, value] of Object.entries(headers)) {
        resolved[resolveVariables(key, variables)] = resolveVariables(value, variables)
    }

    return resolved
}

/**
 * Parses environment variables JSON string
 */
export function parseEnvironmentVariables(jsonString: string): EnvironmentVariables {
    try {
        const parsed = JSON.parse(jsonString) as unknown
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed as EnvironmentVariables
        }
        return {}
    } catch {
        return {}
    }
}
