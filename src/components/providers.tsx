"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { ThemeProvider } from "styled-components";
import StyledComponentsRegistry from "@/lib/registry";
import { theme } from "@/styles/theme";
import { GlobalStyle } from "@/styles/global-style";

/**
 * კლიენტის მხარის provider-ები, root layout-ში ერთხელ ჩამონტაჟებული:
 * - StyledComponentsRegistry: styled-components-ის SSR
 * - ThemeProvider + GlobalStyle: დიზაინის ტოკენები
 * - QueryClientProvider: server-state ქეში (TanStack Query)
 * - NuqsAdapter: nuqs-ს URL search params-თან წვდომას აძლევს
 * - Toaster: მუტაციების შეტყობინებები (sonner)
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  // ერთი QueryClient სესიაზე; lazy init ინარჩუნებს მას რენდერებს შორის.
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
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}
