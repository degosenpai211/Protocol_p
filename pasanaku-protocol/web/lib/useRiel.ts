"use client";

import { useMemo } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { createPasanaku } from "@pasanaku/sdk";
import { PROTOCOL_ADDRESS } from "@/lib/chain";

export function useRiel() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!publicClient || !walletClient || PROTOCOL_ADDRESS?.length !== 42) return null;
    return createPasanaku({
      publicClient,
      walletClient,
      protocol: PROTOCOL_ADDRESS,
    });
  }, [publicClient, walletClient]);
}
