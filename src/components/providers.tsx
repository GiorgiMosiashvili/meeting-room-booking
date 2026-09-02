"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import StyledComponentsRegistry from "@/lib/registry";

/**
 * Client-side app shell providers, mounted once in the root layout:
 * - StyledComponentsRegistry: SSR style flushing for styled-components
 * - QueryClientProvider: server-state cache (TanStack Query)
 * - NuqsAdapter: lets nuqs read/write URL search params under the App Router
 * - Toaster: mutation success/error notifications (sonner)
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  // One QueryClient per browser session; lazy init keeps it stable across renders.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <StyledComponentsRegistry>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </StyledComponentsRegistry>
  );
}
