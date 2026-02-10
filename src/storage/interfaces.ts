/**
 * Core data interfaces for restiqo storage
 */

/**
 * Collection entity representing a group of API requests
 */
export interface Collection {
    id: string;
    userId: string;
    name: string;
    headers?: string;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
    requests?: Request[];
}

/**
 * Request entity representing a single API endpoint
 */
export interface Request {
    id: string;
    collectionId: string;
    name: string;
    method: string;
    url: string;
    headers?: string;
    body?: string | null;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Environment entity for storing environment variables
 */
export interface Environment {
    id: string;
    name: string;
    variables: string;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * History entry for tracking executed requests
 */
export interface HistoryEntry {
    id: string;
    userId: string;
    method: string;
    url: string;
    status: number;
    duration: number;
    requestHeaders: string;
    requestBody?: string | null;
    responseHeaders: string;
    responseBody?: string | null;
    createdAt: string;
}

/**
 * Input data for creating a collection
 */
export interface CreateCollectionInput {
    name: string;
    headers?: string;
}

/**
 * Input data for updating a collection
 */
export interface UpdateCollectionInput {
    name?: string;
    headers?: string;
}

/**
 * Input data for creating a request
 */
export interface CreateRequestInput {
    collectionId: string;
    name: string;
    method: string;
    url: string;
    headers?: string;
    body?: string | null;
}

/**
 * Input data for updating a request
 */
export interface UpdateRequestInput {
    name?: string;
    method?: string;
    url?: string;
    headers?: string;
    body?: string | null;
}

/**
 * Input data for creating an environment
 */
export interface CreateEnvironmentInput {
    name: string;
    variables: string;
}

/**
 * Input data for updating an environment
 */
export interface UpdateEnvironmentInput {
    name?: string;
    variables?: string;
}

/**
 * Input data for adding to history
 */
export interface AddToHistoryInput {
    method: string;
    url: string;
    status: number;
    duration: number;
    requestHeaders: string;
    requestBody?: string | null;
    responseHeaders: string;
    responseBody?: string | null;
}

/**
 * Custom schema extractor function
 */
export type SchemaExtractor = (handle: unknown) => Record<string, unknown> | null;

/**
 * Express layer type for route scanning
 */
export interface ExpressLayer {
    route?: {
        path: string;
        methods: Record<string, boolean>;
        stack: ExpressLayer[];
    };
    name?: string;
    handle?: {
        stack?: ExpressLayer[];
        zodSchema?: ZodSchemaLike;
        schema?: {
            zodSchema?: ZodSchemaLike;
        } | ZodSchemaLike;
        params?: {
            zodSchema?: ZodSchemaLike;
        };
        validator?: {
            schema?: ZodSchemaLike;
        };
        bodySchema?: ZodSchemaLike;
        [key: string]: unknown;
    };
    regexp?: RegExp;
}

/**
 * Represents a JSON-serializable value
 */
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * Zod-like schema interface for validation schema detection
 */
export interface ZodSchemaLike {
    _def?: {
        typeName?: string;
        schema?: ZodSchemaLike;
        innerType?: ZodSchemaLike;
        shape?: Record<string, ZodSchemaLike> | (() => Record<string, ZodSchemaLike>);
        values?: string[];
    };
    shape?: Record<string, ZodSchemaLike> | (() => Record<string, ZodSchemaLike>);
    safeParse?: (data: JsonValue) => JsonValue;
    parse?: (data: JsonValue) => JsonValue;
    isJoi?: boolean;
    type?: string;
    keys?: Record<string, JsonValue>;
    _ids?: {
        _byKey?: Map<string, JsonValue>;
    };
}

/**
 * Parsed headers object
 */
export interface ParsedHeaders {
    [key: string]: string;
}

/**
 * Postman collection export format
 */
export interface PostmanCollection {
    info: {
        name: string;
        schema: string;
    };
    item: PostmanItem[];
}

/**
 * Postman collection item
 */
export interface PostmanItem {
    name: string;
    request: {
        method: string;
        header: PostmanHeader[];
        body: {
            mode: string;
            raw: string;
            options: {
                raw: {
                    language: string;
                };
            };
        };
        url: {
            raw: string;
            host: string[];
            path: string[];
        };
    };
}

/**
 * Postman header format
 */
export interface PostmanHeader {
    key: string;
    value: string;
    type: string;
}

/**
 * OpenAPI specification paths
 */
export interface OpenApiPaths {
    [path: string]: {
        [method: string]: {
            summary: string;
            responses: {
                [statusCode: string]: {
                    description: string;
                };
            };
        };
    };
}
