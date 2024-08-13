import { siteConfig } from "@/lib/config";
import { APIEndPoints } from "@/types";
import axios, { type CancelToken } from "axios";

export const baseURL = siteConfig.API_LIVE_URL;

const client = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

type Request = {
  url: APIEndPoints;
  requestBody?: string;
  headers: any;
  cancelToken?: CancelToken;
};

class App {
  post<TResponse>({ url, requestBody, headers, cancelToken }: Request) {
    const body = requestBody ? { requestBody } : undefined;
    return client.post<TResponse>(url, body, {
      headers: headers,
      cancelToken: cancelToken,
    });
  }

  get<TResponse>({ url, cancelToken }: Request) {
    return client.get<TResponse>(url, {
      data: {},
      cancelToken: cancelToken,
    });
  }
}

const app = new App();

export default {
  app,
};
