'use client';

import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { ToastProvider } from "@/app/components/ui/ToastProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  // Initialize a QueryClient for React Query
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </OrganizationProvider>
    </QueryClientProvider>
  );
}
