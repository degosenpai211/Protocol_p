import { createPublicClient, http, type Address } from "viem";
import { avalanche } from "viem/chains";
import { UNLOCK_LOCK } from "./chain";

/** Factory oficial Unlock en Avalanche C-Chain. No hay deploy oficial en Fuji. */
export const UNLOCK_FACTORY = "0x70cBE5F72dD85aA634d07d2227a421144Af734b3" as const;
export const unlockChain = avalanche;

export const lockAbi = [
  {
    type: "function",
    name: "getHasValidKey",
    stateMutability: "view",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

const unlockClient = createPublicClient({
  chain: avalanche,
  transport: http("https://api.avax.network/ext/bc/C/rpc", { batch: true }),
});

export function lockConfigured() {
  return UNLOCK_LOCK?.length === 42;
}

export async function readHasValidKey(user: Address) {
  if (!lockConfigured()) return null;
  return unlockClient.readContract({
    address: UNLOCK_LOCK,
    abi: lockAbi,
    functionName: "getHasValidKey",
    args: [user],
  });
}
