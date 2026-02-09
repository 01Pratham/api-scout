import fs from 'fs';
import path from 'path';

import { Router, json, static as expressStatic } from 'express';

import { CaptureService } from './core/capture-service';
import { executeRequest, type ExecuteRequest } from './core/executor';
import { requestInterceptor } from './middleware/interceptor';
import { JsonStorageProvider } from './storage/json-provider';

import type {
    OpenApiPaths,
    PostmanHeader,
    ParsedHeaders,
    CreateCollectionInput,
    UpdateCollectionInput,
    CreateRequestInput,
    UpdateRequestInput,
    CreateEnvironmentInput,
    UpdateEnvironmentInput,
    PostmanCollection,
    Request as StoreRequest
} from './storage/interfaces';
import type { IStorageProvider } from './storage/types';
import type { Express, Request, Response, NextFunction } from 'express';

export interface ApiTesterOptions {
    app: Express;
    storage?: IStorageProvider;
    path?: string;
    authMiddleware?: (req: Request, res: Response, next: NextFunction) => void;
    autoCapture?: boolean;
    excludePaths?: string[];
    userId?: string;
    storagePath?: string; // Path for JSON storage
    customizationPath?: string; // Path for user customizations
    ignoreSegments?: string[]; // Path segments to ignore for folder logic
}

/**
 * Main entry point for vibe-test library
 */
export function vibeTest(options: ApiTesterOptions): Router {
    const router = Router();
    const userId = options.userId ?? 'system';
    const projectName = getProjectName();

    const storage = options.storage ?? new JsonStorageProvider(options.storagePath, options.customizationPath, projectName);

    if (storage.init !== undefined) {
        void storage.init().catch(() => { /* Silently fail */ });
    }

    const captureService = new CaptureService(storage);
    const mountPath = options.path ?? '/api-tester';

    setImmediate(() => {
        void initializeCapture(options.app, storage, captureService, userId, projectName, mountPath);
    });

    // Ensure trailing slash for UI
    router.use((req: Request, res: Response, next: NextFunction): void | Response => {
        if ((req.url === '' || req.url === '/') && !req.originalUrl.endsWith('/')) {
            return res.redirect(301, `${req.originalUrl}/`);
        }
        next();
    });

    if (options.autoCapture !== false) {
        options.app.use(requestInterceptor(storage, {
            mountPath,
            userId,
            excludePaths: options.excludePaths
        }));
    }

    if (options.authMiddleware !== undefined) {
        router.use(options.authMiddleware);
    }

    router.use(json());

    setupApiRoutes(router, storage, userId, options);
    setupExportRoutes(router, storage, userId);
    setupAuthRoutes(router);
    setupStaticRoutes(router);

    return router;
}

function getProjectName(): string {
    let projectName = 'Auto-Captured';
    try {
        const pkgPath = path.resolve(process.cwd(), 'package.json');
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { name?: string };
            const name = pkg.name;
            if (name !== undefined && name !== null && name !== '') {
                projectName = name
                    .replace(/^@[^/]+\//, '')
                    .replace(/[-_]/g, ' ')
                    .split(' ')
                    .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
                    .join(' ');
            }
        }
    } catch (e) { /* Silently fail */ }
    return projectName;
}

async function initializeCapture(app: Express, storage: IStorageProvider, captureService: CaptureService, userId: string, projectName: string, mountPath: string): Promise<void> {
    if (storage.clearCache !== undefined) {
        await storage.clearCache();
    }
    await captureService.capture(app, userId, projectName).catch(() => { /* Silently fail */ });
    const port = process.env.PORT ?? '3000';
    process.stdout.write(`\x1b[32mVibe Test URL :- http://localhost:${port}${mountPath}\x1b[0m\n`);
}

function setupApiRoutes(router: Router, storage: IStorageProvider, userId: string, options: ApiTesterOptions): void {
    router.get('/__api__/settings', (req: Request, res: Response) => {
        res.json({ ignoreSegments: options.ignoreSegments ?? ['api', 'v1'] });
    });

    // Collections
    router.get('/__api__/collections', (req: Request, res: Response) => {
        const get = async (): Promise<void> => {
            try {
                const collections = await storage.getCollections(userId);
                res.json({ collections });
            } catch (err) {
                res.status(500).json({ error: (err as Error).message });
            }
        };
        void get();
    });

    router.post('/__api__/collections', (req: Request, res: Response) => {
        const create = async (): Promise<void> => {
            const collection = await storage.createCollection(userId, req.body as CreateCollectionInput);
            res.status(201).json({ collection });
        };
        void create();
    });

    router.put('/__api__/collections/:id', (req: Request, res: Response) => {
        const update = async (): Promise<void> => {
            await storage.updateCollection(req.params.id, req.body as UpdateCollectionInput);
            res.status(200).json({ success: true });
        };
        void update();
    });

    // Requests
    router.post('/__api__/requests', (req: Request, res: Response) => {
        const create = async (): Promise<void> => {
            const request = await storage.createRequest(req.body as CreateRequestInput);
            res.status(201).json({ request });
        };
        void create();
    });

    router.get('/__api__/requests/:id', (req: Request, res: Response) => {
        const get = async (): Promise<void> => {
            const request = await storage.getRequest(req.params.id);
            res.json({ request });
        };
        void get();
    });

    router.put('/__api__/requests/:id', (req: Request, res: Response) => {
        const update = async (): Promise<void> => {
            await storage.updateRequest(req.params.id, req.body as UpdateRequestInput);
            res.status(200).json({ success: true });
        };
        void update();
    });

    router.delete('/__api__/requests/:id', (req: Request, res: Response) => {
        const remove = async (): Promise<void> => {
            await storage.deleteRequest(req.params.id);
            res.status(204).end();
        };
        void remove();
    });

    setupExecutionRoute(router, storage, userId);
    setupHistoryRoutes(router, storage, userId);
    setupEnvironmentRoutes(router, storage);
}

function resolveVariables(text: string, variables: Record<string, string>): string {
    if (text === undefined || text === null || text === '') {
        return text;
    }
    return text.replace(/\{\{([^}]+)\}\}/g, (match: string, key: string): string => {
        return variables[key] ?? match;
    });
}

function setupExecutionRoute(router: Router, storage: IStorageProvider, userId: string): void {
    router.post('/__api__/execute', (req: Request, res: Response) => {
        const execute = async (): Promise<void> => {
            try {
                interface ExecutionData {
                    method: string;
                    url: string;
                    headers?: Record<string, string>;
                    body?: string;
                    variables?: Record<string, string>;
                    environmentId?: string;
                    requestId?: string;
                }

                const executionData = { ...(req.body as Record<string, unknown>) } as unknown as ExecutionData;
                let variables: Record<string, string> = {};

                // Load environment variables
                if (executionData.variables !== undefined) {
                    variables = executionData.variables;
                } else {
                    variables = await loadVariablesFromStorage(storage, executionData.environmentId);
                }

                // Merge Collection Headers
                if (executionData.requestId !== undefined) {
                    const colHeaders = await getCollectionHeaders(storage, userId, executionData.requestId, variables);
                    executionData.headers = { ...colHeaders, ...(executionData.headers ?? {}) };
                }

                // Resolve variables
                executionData.url = resolveVariables(executionData.url, variables);
                if (executionData.headers !== undefined) {
                    const resolvedHeaders: Record<string, string> = {};
                    for (const [key, value] of Object.entries(executionData.headers)) {
                        resolvedHeaders[key] = resolveVariables(value, variables);
                    }
                    executionData.headers = resolvedHeaders;
                }
                if (executionData.body !== undefined) {
                    executionData.body = resolveVariables(executionData.body, variables);
                }

                const response = await executeRequest(executionData as ExecuteRequest);

                await storage.addToHistory(userId, {
                    method: executionData.method,
                    url: executionData.url,
                    status: response.status ?? 0,
                    duration: response.time ?? 0,
                    requestHeaders: JSON.stringify(executionData.headers),
                    requestBody: executionData.body ?? '',
                    responseHeaders: JSON.stringify(response.headers),
                    responseBody: typeof response.body === 'string' ? response.body : JSON.stringify(response.body)
                });

                res.json(response);
            } catch (err) {
                res.status(500).json({ error: (err as Error).message });
            }
        };
        void execute();
    });
}

async function loadVariablesFromStorage(storage: IStorageProvider, environmentId?: string): Promise<Record<string, string>> {
    const envs = await storage.getEnvironments();
    const env = environmentId !== undefined
        ? envs.find(e => e.id === environmentId)
        : envs.find(e => e.name === 'Local Environment');

    if (env !== undefined) {
        try {
            return JSON.parse(env.variables) as Record<string, string>;
        } catch {
            /* Ignore */
        }
    }
    return {};
}

async function getCollectionHeaders(storage: IStorageProvider, userId: string, requestId: string, variables: Record<string, string>): Promise<Record<string, string>> {
    try {
        const requestDetail = await storage.getRequest(requestId);
        if (requestDetail?.collectionId !== undefined) {
            const collections = await storage.getCollections(userId);
            const col = collections.find(c => c.id === requestDetail.collectionId);
            if (col?.headers !== undefined && col.headers !== '' && col.headers !== null) {
                const resolvedHeaders = resolveVariables(col.headers, variables);
                return JSON.parse(resolvedHeaders) as Record<string, string>;
            }
        }
    } catch {
        /* Ignore */
    }
    return {};
}

function setupHistoryRoutes(router: Router, storage: IStorageProvider, userId: string): void {
    router.get('/__api__/history', (req: Request, res: Response) => {
        const get = async (): Promise<void> => {
            try {
                const history = await storage.getHistory(userId);
                res.json({ history });
            } catch (err) {
                res.status(500).json({ error: (err as Error).message });
            }
        };
        void get();
    });

    router.delete('/__api__/history', (req: Request, res: Response) => {
        const clear = async (): Promise<void> => {
            await storage.clearHistory(userId);
            res.status(204).end();
        };
        void clear();
    });

    router.delete('/__api__/history/:id', (req: Request, res: Response) => {
        const remove = async (): Promise<void> => {
            await storage.deleteHistoryItem(req.params.id);
            res.status(204).end();
        };
        void remove();
    });
}

function setupEnvironmentRoutes(router: Router, storage: IStorageProvider): void {
    router.get('/__api__/environments', (req: Request, res: Response) => {
        const get = async (): Promise<void> => {
            const environments = await storage.getEnvironments();
            res.json({ environments });
        };
        void get();
    });

    router.post('/__api__/environments', (req: Request, res: Response) => {
        const create = async (): Promise<void> => {
            const environment = await storage.createEnvironment(req.body as CreateEnvironmentInput);
            res.status(201).json({ environment });
        };
        void create();
    });

    router.put('/__api__/environments/:id', (req: Request, res: Response) => {
        const update = async (): Promise<void> => {
            await storage.updateEnvironment(req.params.id, req.body as UpdateEnvironmentInput);
            res.status(200).json({ success: true });
        };
        void update();
    });

    router.delete('/__api__/environments/:id', (req: Request, res: Response) => {
        const remove = async (): Promise<void> => {
            await storage.deleteEnvironment(req.params.id);
            res.status(204).end();
        };
        void remove();
    });
}

function setupExportRoutes(router: Router, storage: IStorageProvider, userId: string): void {
    router.get('/__api__/export-openapi/:id', (req: Request, res: Response) => {
        const getExport = async (): Promise<void> => {
            try {
                const requests = await storage.getRequests(req.params.id);
                const spec = {
                    openapi: '3.0.0',
                    info: { title: 'Exported Collection', version: '1.0.0' },
                    paths: {} as OpenApiPaths
                };

                requests.forEach(r => {
                    const pathName = r.url.startsWith('/') ? r.url : `/${r.url}`;
                    if (spec.paths[pathName] === undefined) {
                        spec.paths[pathName] = {};
                    }
                    spec.paths[pathName][r.method.toLowerCase()] = {
                        summary: r.name,
                        responses: { ['200']: { description: 'Success' } }
                    };
                });

                res.json(spec);
            } catch (err) {
                res.status(500).json({ error: (err as Error).message });
            }
        };
        void getExport();
    });

    router.get('/__api__/export-postman/:id', (req: Request, res: Response) => {
        const getExport = async (): Promise<void | Response> => {
            try {
                const collectionId = req.params.id;
                const collections = await storage.getCollections(userId);
                const collection = collections.find(c => c.id === collectionId);

                if (collection === undefined) {
                    return res.status(404).json({ error: 'Collection not found' });
                }

                const requests = await storage.getRequests(collectionId);
                const postmanCollection = buildPostmanCollection(collection.name, requests);

                res.setHeader('Content-Disposition', `attachment; filename="${collection.name.replace(/[^a-z0-9]/gi, '_')}.postman_collection.json"`);
                res.json(postmanCollection);
            } catch (err) {
                res.status(500).json({ error: (err as Error).message });
            }
        };
        void getExport();
    });
}

function buildPostmanCollection(name: string, requests: StoreRequest[]): PostmanCollection {
    return {
        info: {
            name,
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        item: requests.map((r: StoreRequest) => {
            const headers: PostmanHeader[] = [];
            try {
                if (r.headers !== undefined && r.headers !== null && r.headers !== '') {
                    const parsedHeaders = JSON.parse(r.headers) as ParsedHeaders;
                    Object.entries(parsedHeaders).forEach(([key, value]) => {
                        headers.push({ key, value: String(value), type: 'text' });
                    });
                }
            } catch {
                /* Ignore */
            }

            return {
                name: r.name,
                request: {
                    method: r.method,
                    header: headers,
                    body: {
                        mode: 'raw',
                        raw: r.body ?? '',
                        options: { raw: { language: 'json' } }
                    },
                    url: {
                        raw: r.url,
                        host: r.url.includes('://') ? [(r.url.split('://')[1] ?? '').split('/')[0]] : [r.url.split('/')[0]],
                        path: r.url.includes('://') ? (r.url.split('://')[1] ?? '').split('/').slice(1) : r.url.split('/').slice(1)
                    }
                }
            };
        })
    };
}

function setupAuthRoutes(router: Router): void {
    router.post('/__api__/auth/logout', (req: Request, res: Response) => {
        res.json({ success: true });
    });
}

function setupStaticRoutes(router: Router): void {
    const uiPath = path.join(__dirname, '../ui');
    router.use('/', expressStatic(uiPath));
    router.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(uiPath, 'index.html'));
    });
}

export * from './storage/types';
export * from './storage/json-provider';
export * from './storage/interfaces';
