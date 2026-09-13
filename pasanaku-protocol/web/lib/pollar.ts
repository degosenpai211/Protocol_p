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

/** Config local completa. `appConfig={{}}` apagaba Google, USDC y funding. */
export const RIEL_POLLAR_APP_CONFIG = {
  application: {
    name: "Riel",
    network: POLLAR_NETWORK,
    chains: ["STELLAR"] as ("STELLAR" | "POLYGON" | "SOLANA")[],
  },
  styles: {
    theme: "dark",
    accentColor: "#E0783A",
    backgroundColor: "#161411",
    textColor: "#F3EEE6",
    buttonColor: "#E0783A",
    emailEnabled: true,
    embeddedWallets: true,
    smartWallet: false,
    providers: {
      google: true,
      github: true,
    },
  },
};

export function usdcAsset() {
  return POLLAR_NETWORK === "mainnet" ? STELLAR_USDC_MAINNET : STELLAR_USDC_TESTNET;
}

export function usdcIssuer() {
  return usdcAsset().issuer;
}

export function stellarExpertTx(hash: string) {
  const net = POLLAR_NETWORK === "mainnet" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${net}/tx/${hash}`;
}

export function stellarExpertAccount(address: string) {
  const net = POLLAR_NETWORK === "mainnet" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${net}/account/${address}`;
}

export function horizonBase() {
  return POLLAR_NETWORK === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
}

export type HorizonSnap = {
  exists: boolean;
  xlm: number;
  usdc: number;
  hasUsdcTrust: boolean;
};

export async function loadHorizon(address: string): Promise<HorizonSnap> {
  const res = await fetch(`${horizonBase()}/accounts/${address}`);
  if (res.status === 404) {
    return { exists: false, xlm: 0, usdc: 0, hasUsdcTrust: false };
  }
  if (!res.ok) throw new Error(`Horizon ${res.status}`);
  const data = (await res.json()) as {
    balances?: Array<{
      asset_type?: string;
      asset_code?: string;
      asset_issuer?: string;
      balance?: string;
    }>;
  };
  const issuer = usdcIssuer();
  let xlm = 0;
  let usdc = 0;
  let hasUsdcTrust = false;
  for (const row of data.balances ?? []) {
    if (row.asset_type === "native") xlm = Number(row.balance ?? 0);
    if (row.asset_code === "USDC" && row.asset_issuer === issuer) {
      hasUsdcTrust = true;
      usdc = Number(row.balance ?? 0);
    }
  }
  return { exists: true, xlm, usdc, hasUsdcTrust };
}

export async function fundFriendbot(address: string): Promise<{ ok: boolean; detail: string }> {
  const res = await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(address)}`);
  if (res.ok) return { ok: true, detail: "Friendbot acreditó XLM de prueba." };
  const text = await res.text();
  if (text.toLowerCase().includes("already") || res.status === 400) {
    return { ok: true, detail: "La cuenta ya existe en testnet (Friendbot no vuelve a pagar)." };
  }
  return { ok: false, detail: text.slice(0, 180) || `Friendbot ${res.status}` };
}

export function nativeAsset() {
  return { type: "native" as const };
}
