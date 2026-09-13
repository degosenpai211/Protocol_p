export const STELLAR_USDC_MAINNET = {
  type: "credit_alphanum4" as const,
  code: "USDC",
  issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
};

export const STELLAR_USDC_TESTNET = {
  type: "credit_alphanum4" as const,
  code: "USDC",
  issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
};

export const POLLAR_API_KEY = process.env.NEXT_PUBLIC_POLLAR_API_KEY || "";
export const POLLAR_DESTINO = process.env.NEXT_PUBLIC_POLLAR_DESTINO || "";
export const POLLAR_NETWORK =
  process.env.NEXT_PUBLIC_POLLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";
export const POLLAR_MAINNET_ARMED =
  process.env.NEXT_PUBLIC_POLLAR_MAINNET_ARMED === "true";

export const HASH_STORAGE_KEY = "riel_pollar_hash";

export const POLLAR_QUIET_LOGGER = {
  error() {},
  warn() {},
  info() {},
  debug() {},
};

export function usdcAsset() {
  return POLLAR_NETWORK === "mainnet" ? STELLAR_USDC_MAINNET : STELLAR_USDC_TESTNET;
}

export function stellarExpertTx(hash: string) {
  const net = POLLAR_NETWORK === "mainnet" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${net}/tx/${hash}`;
}
