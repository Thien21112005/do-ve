import React, { useEffect, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  queryClient,
  setupNetworkAndFocusManagement,
  setupQueryClientPersistence,
} from '@/lib';

export interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    const cleanupNetwork = setupNetworkAndFocusManagement();
    const [cleanupPersistence] = setupQueryClientPersistence();
    return () => {
      cleanupNetwork();
      cleanupPersistence();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
