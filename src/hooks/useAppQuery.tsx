import { APIEndPoints } from "@/types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "react-query";
import api from "@/services/api";
import axios from "axios";

type Request = { url: APIEndPoints; requestBody?: any };

export function useAppQuery<TResponse>(
  queryKey: string | readonly unknown[],
  { url, requestBody }: Request
) {
  return useQuery<TResponse, Error>(
    queryKey,
    async () => {
      const controller = new AbortController();
      const signal = controller.signal;

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 20000); // 20 seconds

      return api.app
        .get<TResponse>(
          { url, requestBody, headers: { "Content-Type": "application/json" } },
          { signal }
        )
        .finally(() => {
          clearTimeout(timeoutId);
        });
    },
    {
      onError: (error) => {
        if (axios.isCancel(error)) {
          console.log("Request cancelled:", error.message);
        } else {
          console.error("Query error:", error);
        }
      },
    }
  );
}
