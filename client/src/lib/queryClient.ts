import { QueryClient } from "@tanstack/react-query";
import { apiRequest } from "./apiClient";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export { apiRequest };