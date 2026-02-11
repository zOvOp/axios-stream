import { AxiosInstance, AxiosRequestConfig } from "axios";

export interface SSEEvent {
  event?: string;
  data?: string;
  id?: string;
  retry?: number;
}

function parseSSEEvent(eventBlock: string): SSEEvent | null {
  const lines = eventBlock.split("\n");
  const result: SSEEvent = {};
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("data:")) {
      // Support both "data: content" and "data:content"
      const content = line.slice(5);
      dataLines.push(content.startsWith(" ") ? content.slice(1) : content);
    } else if (line.startsWith("event:")) {
      result.event = line.slice(6).trim();
    } else if (line.startsWith("id:")) {
      result.id = line.slice(3).trim();
    } else if (line.startsWith("retry:")) {
      const retry = parseInt(line.slice(6).trim(), 10);
      if (!isNaN(retry)) result.retry = retry;
    }
    // Ignore comments (lines starting with :) and unknown fields
  }

  // Join multiple data lines with newline (per SSE spec)
  if (dataLines.length > 0) {
    result.data = dataLines.join("\n");
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Parse SSE data chunk (simple, stateless version)
 * @param {string} sseText - Raw SSE text chunk
 * @param {Function} onMessage - Callback receiving data content string
 */
export function parseSSEChunk(sseText: string, onMessage: (data: string) => void): void {
  const events = sseText.split("\n\n").filter(Boolean);
  for (const eventBlock of events) {
    const parsed = parseSSEEvent(eventBlock);
    if (parsed?.data) {
      onMessage(parsed.data);
    }
  }
}

/**
 * Create a stateful SSE parser with buffer for handling chunks that may be split
 * @param {Function} onMessage - Callback receiving parsed SSE event object { event?, data?, id?, retry? }
 * @returns {Function} Parser function that accepts raw chunk string
 */
export function createSSEParser(onMessage: (event: SSEEvent) => void): (chunk: string) => void {
  let buffer = "";

  return (chunk: string) => {
    buffer += chunk;
    // Split by double newline (SSE event separator)
    const parts = buffer.split("\n\n");
    // Keep the last incomplete part in buffer
    buffer = parts.pop() || "";

    for (const eventBlock of parts) {
      if (!eventBlock.trim()) continue;
      const parsed = parseSSEEvent(eventBlock);
      if (parsed) {
        onMessage(parsed);
      }
    }
  };
}

export interface StreamOptions extends AxiosRequestConfig {
  retry?: number;
  retryDelay?: number;
}

export type CancelFunction = () => void;
export type OnChunk = (chunk: string) => void;
export type OnComplete = () => void;
export type OnError = (error: any) => void;

/**
 * Create a stream request function bound to an axios instance
 * @param {import('axios').AxiosInstance} instance
 */
export const createStreamRequest = (instance: AxiosInstance) => {
  return async (
    options: StreamOptions = {},
    onChunk?: OnChunk,
    onComplete?: OnComplete,
    onError?: OnError
  ): Promise<CancelFunction> => {
    const controller = new AbortController();
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let externalSignalHandler: (() => void) | null = null;

    // Handle external signal
    if (options.signal) {
      if (options.signal.aborted) {
        controller.abort();
      } else {
        externalSignalHandler = () => controller.abort();
        (options.signal as AbortSignal).addEventListener("abort", externalSignalHandler);
      }
    }

    const cleanup = () => {
      if (options.signal && externalSignalHandler) {
        (options.signal as AbortSignal).removeEventListener("abort", externalSignalHandler);
        externalSignalHandler = null;
      }
    };

    const cancelRequest = () => {
      try {
        cleanup();
        controller.abort();
        reader?.releaseLock();
        // Only trigger onError if we are actually canceling a running/pending request
        // and we haven't already finished.
        if (onError) onError("Stream request cancelled manually");
      } catch (err) {
        console.error("Failed to cancel stream request:", err);
      }
    };

    const maxRetries = options.retry || 0;
    const retryDelay = options.retryDelay || 1000;
    let attempts = 0;

    const makeRequest = async () => {
      try {
        if (controller.signal.aborted) return;

        const response: any = await instance({
          ...options,
          // @ts-ignore
          isStream: true,
          // Force critical config for streaming
          adapter: "fetch",
          responseType: "stream",
          timeout: 0,
          signal: controller.signal,
        } as AxiosRequestConfig);

        // Handle both standard axios response and unwrapped response (by user interceptors)
        // If user's interceptor returned response.data, 'response' itself might be the stream
        const readableStream =
          response.data ||
          response.body ||
          (response.getReader ? response : null);

        if (!readableStream || typeof readableStream.getReader !== "function") {
          throw new Error(
            "Browser does not support stream response, API did not return stream, or response was transformed incorrectly",
          );
        }

        const decoder = new TextDecoder("utf-8");
        reader = readableStream.getReader();

        const readStreamChunk = async () => {
          try {
            if (!reader) return;
            const { done, value } = await reader.read();
            if (done) {
              cleanup();
              if (onComplete) onComplete();
              return;
            }
            const chunk = decoder.decode(value, { stream: true });

            if (onChunk) onChunk(chunk);
            await readStreamChunk();
          } catch (err: any) {
            cleanup();
            if (err.name === "AbortError") return;
            if (onError) onError(`Read stream failed: ${err.message}`);
          }
        };

        readStreamChunk();
      } catch (err: any) {
        if (
          err.name === "CanceledError" ||
          err.code === "ERR_CANCELED" ||
          controller.signal.aborted
        ) {
          return;
        }

        if (attempts < maxRetries) {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return makeRequest();
        }

        const errorMsg = err.message || "Stream request failed";
        if (onError) onError(errorMsg);
        console.error("Stream request failed:", errorMsg);
      }
    };

    makeRequest();

    return cancelRequest;
  };
};
