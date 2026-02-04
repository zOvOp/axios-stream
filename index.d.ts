import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface StreamOptions extends AxiosRequestConfig {
    /**
     * Optional AbortSignal to cancel the request from outside
     */
    signal?: AbortSignal;
}

export type CancelFunction = () => void;

export type OnChunkCallback = (chunk: string) => void;
export type OnCompleteCallback = () => void;
export type OnErrorCallback = (error: Error | string) => void;

/**
 * Creates a stream request.
 * Returns a Promise that resolves to a cancel function.
 */
export interface StreamMethod {
    (
        options: StreamOptions,
        onChunk?: OnChunkCallback,
        onComplete?: OnCompleteCallback,
        onError?: OnErrorCallback
    ): Promise<CancelFunction>;
}

export interface AxiosStreamInstance extends AxiosInstance {
    stream: StreamMethod;
}

/**
 * Creates an Axios instance with the stream method attached.
 * @param config Axios configuration
 */
export function createInstance(config?: AxiosRequestConfig): AxiosStreamInstance;

/**
 * Attaches the stream method to an existing Axios instance.
 * @param instance The Axios instance to extend
 */
export function attachStream(instance: AxiosInstance): AxiosStreamInstance;

/**
 * Helper to parse SSE (Server-Sent Events) chunks.
 * Note: This is a basic parser and might not handle split chunks correctly.
 * @param chunk The text chunk received
 * @param onMessage Callback for each data message
 */
export function parseSSEChunk(chunk: string, onMessage: (content: string) => void): void;

export interface SSEEvent {
    event?: string;
    data?: string;
    id?: string;
    retry?: number;
}

/**
 * Creates a stateful SSE parser with buffer for handling chunks that may be split.
 * @param onMessage Callback receiving parsed SSE event object
 * @returns Parser function that accepts raw chunk string
 */
export function createSSEParser(onMessage: (event: SSEEvent) => void): (chunk: string) => void;

