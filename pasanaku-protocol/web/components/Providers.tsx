"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "@wagmi/core";
import { WagmiProvider, createConfig, http } from "wagmi";
import { targetChain } from "@/lib/chain";
import { ReactNode, useState } from "react";

const fujiRpc = targetChain.rpcUrls.default.http[0] ?? "https://api.avax-test.network/ext/bc/C/rpc";

export const wagmiConfig = createConfig({
  chains: [targetChain],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [targetChain.id]: http(fujiRpc, { batch: true }),
  },
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 12_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
