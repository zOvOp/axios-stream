import { AxiosRequestConfig } from "axios";

export const defaultConfig: AxiosRequestConfig = {
  timeout: 1000 * 15,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
};
