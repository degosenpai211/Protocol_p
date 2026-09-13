"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PollarProvider, usePollar } from "@pollar/react";
import { useUnlockKey } from "@/components/UnlockGate";
import {
  HASH_STORAGE_KEY,
  POLLAR_API_KEY,
  POLLAR_DESTINO,
  POLLAR_MAINNET_ARMED,
  POLLAR_NETWORK,
  POLLAR_QUIET_LOGGER,
  stellarExpertTx,
  usdcAsset,
} from "@/lib/pollar";
import type { SubmitOutcome, TransactionState, WalletBalanceState } from "@pollar/core";

export function JoinFlow() {
  if (!POLLAR_API_KEY) {
    return <JoinLayout hint="Falta API key de Pollar en el entorno." />;
  }
  return (
    <PollarProvider
      client={{
        apiKey: POLLAR_API_KEY,
        stellarNetwork: POLLAR_NETWORK,
        logLevel: "silent",
        logger: POLLAR_QUIET_LOGGER,
        oauthRedirectUri: typeof window !== "undefined" ? window.location.origin : undefined,
      }}
      appConfig={{}}
    >
      <PollarPay />
    </PollarProvider>
  );
}

function JoinLayout({ hint, children }: { hint?: string; children?: React.ReactNode }) {
  return (
    <div className="rise grid items-start gap-12 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-dim">
          Pollar · compra
        </p>
        <h1 className="mt-8 font-display text-4xl font-semibold leading-tight sm:text-5xl">Activar gremio</h1>
        <p className="mt-4 font-serif text-[1.7rem] italic leading-snug text-ink/80">
          Stellar cobra 1 USDC. El pozo no cruza.
        </p>
        <p className="mt-5 max-w-xl text-[16.5px] leading-7 text-dim">
          Esta no es la cuota del pasanaku. Es la membresía: Pollar cobra, Unlock entrega la Key,
          y recién ahí el contrato deja entrar. Tres rieles, sin puente.
        </p>
        <img
          src="/gremio-pozo.png"
          alt="Pozo del gremio"
          className="mt-8 h-56 w-full rounded-[28px] object-cover sm:h-72"
        />
        <ol className="mt-8 space-y-4">
          <li className="grid grid-cols-[2.2rem_1fr] gap-3">
            <span className="font-num text-xl text-num">1</span>
            <div>
              <p className="font-medium">Google</p>
              <p className="text-sm leading-6 text-dim">Pollar abre OAuth. Si no ves ventana, permití popups.</p>
            </div>
          </li>
          <li className="grid grid-cols-[2.2rem_1fr] gap-3">
            <span className="font-num text-xl text-num">2</span>
            <div>
              <p className="font-medium">1 USDC</p>
              <p className="text-sm leading-6 text-dim">Testnet ahora. Mainnet una sola vez, cuando esté armado.</p>
            </div>
          </li>
          <li className="grid grid-cols-[2.2rem_1fr] gap-3">
            <span className="font-num text-xl text-num">3</span>
            <div>
              <p className="font-medium">Sala</p>
              <p className="text-sm leading-6 text-dim">Con Key Unlock, /portal deja de estar borroso.</p>
            </div>
          </li>
        </ol>
      </div>
      <div className="lg:col-span-6">
        {hint && (
          <p className="mb-6 rounded-2xl border border-line bg-card px-4 py-3 text-sm text-dim">{hint}</p>
        )}
        {children}
      </div>
    </div>
  );
}

function PollarPay() {
  const { hasKey } = useUnlockKey();
  const { isAuthenticated, wallet, login, openLoginModal, runTx, tx, getClient, walletBalance, refreshWalletBalance } =
    usePollar();
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const destino = POLLAR_DESTINO;
  const sending = tx.step !== "idle" && tx.step !== "success" && tx.step !== "error";
  const mainnet = POLLAR_NETWORK === "mainnet";
  const canPayMainnet = !mainnet || POLLAR_MAINNET_ARMED;
  const destinoOk = destino.startsWith("G");
  const usdc = usdcFromBalance(walletBalance);
  const sameWallet = !!wallet?.address && destino === wallet.address;

  useEffect(() => {
    const saved = window.localStorage.getItem(HASH_STORAGE_KEY);
    if (saved) setHash(saved);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void refreshWalletBalance();
  }, [isAuthenticated, refreshWalletBalance]);

  useEffect(() => {
    return getClient().onAuthStateChange((state) => {
      if (state.step !== "error") return;
      const origin = window.location.origin;
      setError(
        `Pollar rechazó el login (403). En dashboard.pollar.xyz → tu app → Allowed domains, agregá ${origin} y recargá.`,
      );
    });
  }, [getClient]);

  function persist(h: string) {
    setHash(h);
    window.localStorage.setItem(HASH_STORAGE_KEY, h);
  }

  function signIn() {
    setError("");
    try {
      login({ provider: "google" });
    } catch {
      openLoginModal();
      setError("Si no abrió Google, usá el modal o permití popups.");
    }
  }

  async function pay() {
    setError("");
    if (!destino.startsWith("G")) {
      setError("Falta destino (G…).");
      return;
    }
    if (mainnet && hash) {
      setError("Ya hay hash.");
      return;
    }
    if (!mainnet && usdc !== null && usdc < 1) {
      setError(
        "Tu wallet tiene 0 USDC testnet. Pedí en faucet.circle.com (red Stellar Testnet) con tu G…, esperá el crédito y volvé a pagar.",
      );
      return;
    }
    try {
      const result = await runTx(
        "payment",
        { destination: destino, amount: "1.00", asset: usdcAsset() },
        { memo: { type: "text", value: "Riel gremio" } },
      );
      if (result.status === "success" && result.hash) persist(result.hash);
      else if (result.status === "error") setError(describePayError(result, tx));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pago falló.");
    }
  }

  return (
    <JoinLayout>
      <div className="glow rounded-[28px] border border-line bg-card p-8 sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">
          {mainnet ? "Mainnet · 1 pago" : "Prueba · testnet"}
        </p>
        <div className="mt-3 flex items-end gap-3">
          <p className="font-num text-6xl leading-none text-num">1</p>
          <p className="mb-1 text-sm text-dim">USDC Stellar</p>
        </div>
        <p className="mt-4 text-[15px] leading-6 text-dim">
          Membresía del gremio. No financia el pasanaku. El contrato de Fuji no ve este dólar.
        </p>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-dim">
          Destino del cobro (tesorería)
        </p>
        <p className="mt-1 break-all font-mono text-[11px] text-dim">
          {destinoOk ? destino : "Falta NEXT_PUBLIC_POLLAR_DESTINO (G…)"}
        </p>
        {!isAuthenticated ? (
          <div className="mt-8 space-y-3">
            <button type="button" onClick={signIn} className="btn w-full bg-ink text-white">
              Continuar con Google
            </button>
            <button
              type="button"
              onClick={() => openLoginModal()}
              className="btn w-full border border-line bg-soft text-ink"
            >
              Otras opciones
            </button>
            <p className="text-xs leading-5 text-dim">
              Tiene que abrir una ventana de Google. Si no: popups, y en el dashboard de Pollar
              autorizá <span className="font-mono">http://localhost:3000</span>.
            </p>
          </div>
        ) : (
          <p className="mt-6 text-xs leading-5 text-dim">
            Tu wallet Pollar (paga, no cobra):{" "}
            <span className="font-mono">{wallet?.address}</span>
          </p>
        )}

        {isAuthenticated && (
          <p className="mt-3 text-xs leading-5 text-dim">
            Saldo USDC: {usdc === null ? "…" : usdc.toFixed(2)}
            {!mainnet && (
              <>
                {" · "}
                <a
                  href="https://faucet.circle.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent underline underline-offset-2"
                >
                  Faucet Circle (Stellar Testnet)
                </a>
              </>
            )}
          </p>
        )}
        {sameWallet && (
          <p className="mt-2 text-xs leading-5 text-dim">
            Destino = tu misma G. En testnet está bien; igual necesitás ≥ 1 USDC para que la tx exista.
          </p>
        )}
        {mainnet && !POLLAR_MAINNET_ARMED && (
          <p className="mt-3 text-xs text-accent">Armá mainnet en .env cuando toque gastar el USDC real.</p>
        )}

        <button
          type="button"
          disabled={!isAuthenticated || sending || !canPayMainnet || !destinoOk || (mainnet && !!hash)}
          onClick={pay}
          className="btn mt-6 w-full bg-accent text-white disabled:opacity-40"
        >
          {sending ? "Enviando…" : "Pagar 1 USDC"}
        </button>
        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      </div>

      <label className="mt-6 block text-[11px] font-semibold uppercase tracking-[0.16em] text-dim">
        Hash de la tx
        <input
          value={hash}
          onChange={(e) => persist(e.target.value.trim())}
          placeholder="se completa solo, o pegalo"
          className="input mt-2 font-mono"
        />
      </label>
      {hash && (
        <div className="rise-2 mt-3 rounded-2xl border border-line bg-card p-4">
          <p className="break-all font-mono text-sm text-num">{hash}</p>
          <a
            href={stellarExpertTx(hash)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs text-dim underline"
          >
            Stellar Expert
          </a>
        </div>
      )}

      <p className="mt-6 text-sm leading-6 text-dim">
        {hasKey ? (
          <Link href="/portal" className="font-medium text-accent underline underline-offset-4">
            Ya tenés Key · entrar a la sala
          </Link>
        ) : (
          "Después del pago: Unlock grant de la Key. Recién ahí se abre la sala."
        )}
      </p>
    </JoinLayout>
  );
}

function usdcFromBalance(state: WalletBalanceState): number | null {
  if (state.step !== "loaded") return null;
  const row = state.data.balances.find((b) => b.code === "USDC");
  if (!row || row.balance == null) return 0;
  const n = Number(row.balance);
  return Number.isFinite(n) ? n : 0;
}

function describePayError(
  result: Extract<SubmitOutcome, { status: "error" }>,
  tx: TransactionState,
): string {
  const extra = tx.step === "error" ? [tx.details, tx.message, tx.code] : [];
  const blob = [result.details, result.message, result.code, result.resultCode, ...extra]
    .filter(Boolean)
    .join(" · ");
  const t = blob.toLowerCase();
  if (t.includes("underfund") || t.includes("insufficient") || t.includes("op_underfunded")) {
    return "Sin USDC suficiente. Testnet: faucet.circle.com (Stellar Testnet) con tu G…";
  }
  if (t.includes("no_trust") || t.includes("trustline") || t.includes("op_no_trust")) {
    return "Falta trustline USDC en destino o en tu wallet.";
  }
  return blob || "Pago falló.";
}
