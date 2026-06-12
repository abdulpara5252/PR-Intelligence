"use client";

import { ApolloProvider } from "@apollo/client/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { getApolloClient } from "@/lib/apollo-client";
import { getQueryClient } from "@/lib/query-client";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const apolloClient = getApolloClient();
  const queryClient = getQueryClient();

  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApolloProvider>
  );
}
