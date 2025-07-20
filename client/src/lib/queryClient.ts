import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Default fetcher function for TanStack Query
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Set up default query function
queryClient.setQueryDefaults(['api'], {
  queryFn: ({ queryKey }) => {
    const url = Array.isArray(queryKey) ? queryKey.join('/') : queryKey;
    return apiRequest(url as string);
  },
});