import { createInstance, AxiosStreamInstance } from "./core/axiosInstance";
import { parseSSEChunk, createSSEParser, createStreamRequest, StreamOptions, SSEEvent, CancelFunction } from "./core/stream";
import { AxiosInstance } from "axios";

export const attachStream = (instance: AxiosInstance): AxiosStreamInstance => {
  (instance as AxiosStreamInstance).stream = createStreamRequest(instance);
  return instance as AxiosStreamInstance;
};

export { createInstance, parseSSEChunk, createSSEParser, createStreamRequest };
export type { AxiosStreamInstance, StreamOptions, SSEEvent, CancelFunction };
