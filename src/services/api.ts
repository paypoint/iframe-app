import { siteConfig } from "@/lib/config";
import { APIEndPoints } from "@/types";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export const baseURL = siteConfig.API_UAT_URL;

const client = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

type Request = { url: APIEndPoints; requestBody: string; headers: any };

class App {
  post<TResponse>({ url, requestBody }: Request, config?: AxiosRequestConfig) {
    return client.post<TResponse>(url, requestBody, config);
  }

  get<TResponse>({ url, requestBody }: Request, config?: AxiosRequestConfig) {
    return client.get<TResponse>(url, { params: requestBody, ...config });
  }
}

const app = new App();

export default {
  app,
};
