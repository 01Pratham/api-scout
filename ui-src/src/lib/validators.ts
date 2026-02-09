import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Execute request schema
export const executeRequestSchema = z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    url: z.string().min(1, 'URL is required'),
    headers: z.record(z.string()).optional(),
    body: z.string().optional(),
    timeout: z.number().min(1000).max(120000).optional(),
    environmentId: z.string().optional(),
    sslVerification: z.boolean().optional(),
    followRedirects: z.boolean().optional(),
    maxResponseSize: z.number().min(1).max(100).optional(),
})

// Collection schemas
export const createCollectionSchema = z.object({
    name: z.string().min(1, 'Collection name is required').max(100),
})

export const updateCollectionSchema = z.object({
    name: z.string().min(1, 'Collection name is required').max(100),
})

// Request schemas
export const createRequestSchema = z.object({
    name: z.string().min(1, 'Request name is required').max(100),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
    url: z.string().min(1, 'URL is required'),
    headers: z.string().default('{}'),
    body: z.string().optional(),
    collectionId: z.string().min(1, 'Collection ID is required'),
})

export const updateRequestSchema = z.object({
    name: z.string().min(1, 'Request name is required').max(100).optional(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
    url: z.string().min(1, 'URL is required').optional(),
    headers: z.string().optional(),
    body: z.string().optional(),
})

// Environment schemas
export const createEnvironmentSchema = z.object({
    name: z.string().min(1, 'Environment name is required').max(50),
    variables: z.string().default('{}'),
})

export const updateEnvironmentSchema = z.object({
    name: z.string().min(1, 'Environment name is required').max(50).optional(),
    variables: z.string().optional(),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ExecuteRequestInput = z.infer<typeof executeRequestSchema>
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>
export type CreateRequestInput = z.infer<typeof createRequestSchema>
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>
export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>
export type UpdateEnvironmentInput = z.infer<typeof updateEnvironmentSchema>
