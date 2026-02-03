import axios from "axios";
import { defaultConfig } from "../config/defaultConfig.js";
import { createStreamRequest } from "./stream.js";

/**
 * Create Axios instance with custom configuration
 * @param {import('axios').AxiosRequestConfig} config
 * @returns {import('axios').AxiosInstance}
 */
export const createInstance = (config = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const instance = axios.create(finalConfig);

  // Attach stream method
  instance.stream = createStreamRequest(instance);

  return instance;
};
