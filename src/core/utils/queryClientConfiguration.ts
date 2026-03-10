import { keepPreviousData, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 10,
      staleTime: 1000 * 60 * 5,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      /* refetchInterval: false, */
      networkMode: 'offlineFirst',
      retryOnMount: false,
      placeholderData: keepPreviousData,
      structuralSharing: true,
      throwOnError: false,
    },
    mutations: {
      retry: 0, // ⚠️ CRÍTICO: Nunca reintentar mutaciones automáticamente en un POS (evita pagos dobles)
      networkMode: 'offlineFirst',
    },
  },
})