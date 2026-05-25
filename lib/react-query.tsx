// lib/react-query.ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';

// Create a client - RE-ENABLED for normal operation
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (gcTime replaced cacheTime in v5)
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Re-enabled for normal operation
      refetchInterval: false, // Keep disabled to prevent infinite calls
      enabled: true, // RE-ENABLE ALL QUERIES for normal operation
    },
    mutations: {
      retry: 1,
    },
  },
});

// Provider component
interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
