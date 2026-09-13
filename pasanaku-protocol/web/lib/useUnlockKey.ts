"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { lockConfigured, readHasValidKey } from "@/lib/unlock";

export function useUnlockKey() {
  const { address, isConnected } = useAccount();
  const configured = lockConfigured();
  const query = useQuery({
    queryKey: ["unlock-key", address],
    queryFn: () => readHasValidKey(address!),
    enabled: configured && !!address,
    staleTime: 20_000,
  });

  return {
    hasKey: configured && address ? (query.data ?? null) : null,
    isConnected,
    configured,
    isLoading: query.isLoading,
  };
}
