import { keepPreviousData, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 30,
      staleTime: 1000 * 60 * 10,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: false,
      networkMode: 'always',
      retryOnMount: false,
      placeholderData: keepPreviousData,
      structuralSharing: true,
      throwOnError: false,
    },
    mutations: {
      retry: 1,
      networkMode: 'always',
    },
  },
})