import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { defaultConfig } from "../config/defaultConfig";
import { createStreamRequest, StreamOptions, CancelFunction, OnChunk, OnComplete, OnError } from "./stream";

// Define the interface for the enhanced instance
export interface AxiosStreamInstance extends AxiosInstance {
  stream: (
    options: StreamOptions,
    onChunk?: OnChunk,
    onComplete?: OnComplete,
    onError?: OnError
  ) => Promise<CancelFunction>;
}

export const createInstance = (config: AxiosRequestConfig = {}): AxiosStreamInstance => {
  const finalConfig = { ...defaultConfig, ...config };
  const instance = axios.create(finalConfig) as AxiosStreamInstance;

  // Attach stream method
  instance.stream = createStreamRequest(instance);

  return instance;
};
