import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Re-enabled for normal operation
      refetchInterval: false, // Keep disabled to prevent infinite calls
    },
    mutations: {
      retry: 1,
    },
  },
});
