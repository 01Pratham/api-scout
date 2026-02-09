import type {
    Collection,
    Request,
    Environment,
    HistoryEntry,
    CreateCollectionInput,
    UpdateCollectionInput,
    CreateRequestInput,
    UpdateRequestInput,
    CreateEnvironmentInput,
    UpdateEnvironmentInput,
    AddToHistoryInput
} from './interfaces';

/**
 * Storage provider interface for vibe-test
 * Defines the contract for all storage implementations
 */
export interface IStorageProvider {
    init?(): Promise<void>;

    // Collections
    getCollections(userId: string): Promise<Collection[]>;
    createCollection(userId: string, data: CreateCollectionInput): Promise<Collection>;
    updateCollection(id: string, data: UpdateCollectionInput): Promise<void>;
    deleteCollection(id: string): Promise<void>;

    // Requests
    getRequests(collectionId: string): Promise<Request[]>;
    getRequest(id: string): Promise<Request | undefined>;
    createRequest(data: CreateRequestInput): Promise<Request>;
    updateRequest(id: string, data: UpdateRequestInput): Promise<void>;
    deleteRequest(id: string): Promise<void>;

    // Environments
    getEnvironments(): Promise<Environment[]>;
    createEnvironment(data: CreateEnvironmentInput): Promise<Environment>;
    updateEnvironment(id: string, data: UpdateEnvironmentInput): Promise<void>;
    deleteEnvironment(id: string): Promise<void>;

    // History
    getHistory(userId: string): Promise<HistoryEntry[]>;
    addToHistory(userId: string, data: AddToHistoryInput): Promise<HistoryEntry>;
    clearHistory(userId: string): Promise<void>;
    deleteHistoryItem(id: string): Promise<void>;
    clearCache?(): Promise<void>;
}
