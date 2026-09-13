import { avalancheFuji } from "viem/chains";

/** Red de demo del riel (pozo). El lock Unlock vive en C-Chain (43114). */
export const targetChain = avalancheFuji;
export { avalancheFuji };

export const PROTOCOL_ADDRESS = (process.env.NEXT_PUBLIC_PROTOCOL_ADDRESS ||
  "") as `0x${string}`;
export const TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ||
  "") as `0x${string}`;
export const UNLOCK_LOCK = (process.env.NEXT_PUBLIC_UNLOCK_LOCK ||
  "") as `0x${string}`;
