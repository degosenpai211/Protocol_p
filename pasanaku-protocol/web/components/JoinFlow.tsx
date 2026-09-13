"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, Wallet } from "lucide-react";
import { FreighterAdapter, WalletType } from "@pollar/core";
import { PollarProvider, usePollar } from "@pollar/react";

const pollarAdapters = { [WalletType.FREIGHTER]: new FreighterAdapter() };
import { useUnlockKey } from "@/components/UnlockGate";
import {
  HASH_STORAGE_KEY,
  POLLAR_API_KEY,
  POLLAR_DESTINO,
  POLLAR_MAINNET_ARMED,
  POLLAR_NETWORK,
  POLLAR_QUIET_LOGGER,
  RIEL_POLLAR_APP_CONFIG,
  fundFriendbot,
  loadHorizon,
  nativeAsset,
  stellarExpertAccount,
  stellarExpertTx,
  usdcAsset,
  usdcIssuer,
  type HorizonSnap,
} from "@/lib/pollar";
import type { SubmitOutcome, TransactionState } from "@pollar/core";

export function JoinFlow() {
  if (!POLLAR_API_KEY) {
    return (
      <p className="rounded-[22px] border border-line bg-card px-4 py-3 text-sm text-dim">
        Falta API key de Pollar en el entorno.
      </p>
    );
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
      appConfig={RIEL_POLLAR_APP_CONFIG}
      adapters={pollarAdapters}
    >
      <PollarPay />
    </PollarProvider>
  );
}

const emptySnap: HorizonSnap = { exists: false, xlm: 0, usdc: 0, hasUsdcTrust: false };

function PollarPay() {
  const { hasKey } = useUnlockKey();
  const {
    isAuthenticated,
    verified,
    wallet,
    login,
    openLoginModal,
    sendPayment,
    setTrustline,
    getSwapQuote,
    swap,
    tx,
    getClient,
  } = usePollar();
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [snap, setSnap] = useState<HorizonSnap>(emptySnap);
  const [busy, setBusy] = useState<"idle" | "fund" | "usdc" | "xlm">("idle");
  const destino = POLLAR_DESTINO;
  const sending = busy !== "idle" || (tx.step !== "idle" && tx.step !== "success" && tx.step !== "error");
  const mainnet = POLLAR_NETWORK === "mainnet";
  const canPayMainnet = !mainnet || POLLAR_MAINNET_ARMED;
  const destinoOk = destino.startsWith("G");
  const payer = wallet?.address ?? "";
  const sameWallet = !!payer && destino === payer;

  const refreshHorizon = useCallback(async () => {
    if (!payer.startsWith("G")) return;
    try {
      setSnap(await loadHorizon(payer));
    } catch {
      setSnap(emptySnap);
    }
  }, [payer]);

  useEffect(() => {
    const saved = window.localStorage.getItem(HASH_STORAGE_KEY);
    if (saved) setHash(saved);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !payer) return;
    void refreshHorizon();
    const t = window.setInterval(() => void refreshHorizon(), 12_000);
    return () => window.clearInterval(t);
  }, [isAuthenticated, payer, refreshHorizon]);

  useEffect(() => {
    return getClient().onAuthStateChange((state) => {
      if (state.step !== "error") return;
      const origin = window.location.origin;
      setError(
        `Pollar rechazó el login. En dashboard.pollar.xyz → Allowed domains, agregá ${origin} y recargá.`,
      );
    });
  }, [getClient]);

  function persist(h: string) {
    setHash(h);
    window.localStorage.setItem(HASH_STORAGE_KEY, h);
  }

  function signIn(provider: "google" | "freighter" | "modal") {
    setError("");
    try {
      if (provider === "modal") openLoginModal();
      else if (provider === "freighter") login({ provider: WalletType.FREIGHTER });
      else login({ provider: "google" });
    } catch {
      openLoginModal();
      setError("Si no abrió la ventana, permití popups.");
    }
  }

  async function copyAddr(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNote("Address copiada.");
    } catch {
      setNote("No se pudo copiar. Seleccioná el G… a mano.");
    }
  }

  async function fundXlm() {
    if (!payer) return;
    setBusy("fund");
    setError("");
    setNote("");
    try {
      const r = await fundFriendbot(payer);
      setNote(r.detail);
      if (!r.ok) setError(r.detail);
      await new Promise((x) => setTimeout(x, 1500));
      await refreshHorizon();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Friendbot falló.");
    } finally {
      setBusy("idle");
    }
  }

  async function ensureUsdcReady() {
    if (!snap.hasUsdcTrust) {
      await setTrustline({ code: "USDC", issuer: usdcIssuer() });
      await new Promise((x) => setTimeout(x, 800));
      await refreshHorizon();
    }
    const afterTrust = await loadHorizon(payer);
    if (afterTrust.usdc >= 1) return afterTrust;
    if (afterTrust.xlm < 4) return afterTrust;
    try {
      const quotes = await getSwapQuote({
        sellAsset: "XLM",
        buyAsset: `USDC:${usdcIssuer()}`,
        amount: "3",
        provider: "auto",
      });
      if (quotes[0]) {
        await swap(quotes[0], { autoTrustline: true });
        await new Promise((x) => setTimeout(x, 1500));
      }
    } catch {
      /* swap puede estar apagado en el dashboard; caemos a XLM */
    }
    return loadHorizon(payer);
  }

  async function handleOutcome(result: SubmitOutcome, kind: "USDC" | "XLM") {
    if (result.status === "success" && result.hash) {
      persist(result.hash);
      setNote(`Listo · pago ${kind} en Stellar.`);
      await refreshHorizon();
      return;
    }
    if (result.status === "pending" && result.hash) {
      persist(result.hash);
      setNote(`Enviada · ${kind} pendiente de confirmación.`);
      return;
    }
    if (result.status === "error") setError(describePayError(result, tx));
  }

  async function payUsdc() {
    setError("");
    setNote("");
    if (!destino.startsWith("G")) return setError("Falta destino (G…).");
    if (mainnet && hash) return setError("Ya hay hash. No repetir el $1.");
    if (mainnet && !POLLAR_MAINNET_ARMED) return setError("Mainnet todavía no está armado.");
    if (!verified) return setError("La sesión Pollar todavía no confirmó. Esperá un segundo.");
    setBusy("usdc");
    try {
      const ready = mainnet ? snap : await ensureUsdcReady();
      if (ready.usdc < 1) {
        setError(
          mainnet
            ? "Esta wallet no tiene 1 USDC mainnet."
            : "Sigue sin 1 USDC. Pedí XLM (Friendbot), esperá, y reintentá: intentamos swap XLM→USDC. Si el swap está apagado en Pollar, usá «Pagar 1 XLM».",
        );
        return;
      }
      const result = await sendPayment({
        destination: destino,
        amount: "1.00",
        asset: usdcAsset(),
      });
      await handleOutcome(result, "USDC");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pago USDC falló.");
    } finally {
      setBusy("idle");
      await refreshHorizon();
    }
  }

  async function payXlm() {
    setError("");
    setNote("");
    if (mainnet) return setError("En mainnet el bounty pide 1 USDC, no XLM.");
    if (!destino.startsWith("G")) return setError("Falta destino (G…).");
    if (!verified) return setError("La sesión Pollar todavía no confirmó. Esperá un segundo.");
    setBusy("xlm");
    try {
      let live = await loadHorizon(payer);
      if (!live.exists || live.xlm < 2) {
        const funded = await fundFriendbot(payer);
        if (!funded.ok) {
          setError(funded.detail);
          return;
        }
        await new Promise((x) => setTimeout(x, 1500));
        live = await loadHorizon(payer);
      }
      if (live.xlm < 1) {
        setError("Sin XLM. Tocá «Pedir XLM de prueba» y esperá 10 s.");
        return;
      }
      const result = await sendPayment({
        destination: destino,
        amount: "1",
        asset: nativeAsset(),
      });
      await handleOutcome(result, "XLM");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pago XLM falló.");
    } finally {
      setBusy("idle");
      await refreshHorizon();
    }
  }

  return (
    <div className="rise-2">
      <div className="glow rounded-[22px] border border-line bg-card p-7 sm:p-8">
        <p className="kicker">{mainnet ? "Mainnet · 1 USDC" : "Testnet · rampa Pollar"}</p>
        <div className="mt-4 flex items-end gap-3">
          <p className="font-num text-5xl leading-none text-num">1</p>
          <p className="mb-1 text-sm text-dim">{mainnet ? "USDC Stellar" : "USDC o 1 XLM de prueba"}</p>
        </div>
        <p className="mt-4 text-[15px] leading-6 text-dim">
          Pollar no alimenta el pozo. En testnet el Circle faucet suele fallar; por eso hay un camino
          que sí cierra: Friendbot → 1 XLM. El $1 USDC real es mainnet, una sola vez.
        </p>

        {!isAuthenticated ? (
          <div className="mt-8 space-y-3">
            <button type="button" onClick={() => signIn("google")} className="btn w-full bg-ink text-canvas">
              Continuar con Google
            </button>
            <button
              type="button"
              onClick={() => signIn("freighter")}
              className="btn w-full border border-line bg-soft text-ink"
            >
              <Wallet size={16} /> Freighter
            </button>
            <button type="button" onClick={() => signIn("modal")} className="btn w-full border border-line text-ink">
              Otras opciones
            </button>
            <p className="text-xs leading-5 text-dim">
              Si Google da 403: dashboard.pollar.xyz → Allowed domains →{" "}
              <span className="font-mono">http://localhost:3000</span>
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dim">Tu wallet (paga)</p>
            <AddrRow value={payer} onCopy={() => copyAddr(payer)} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dim">Tesorería (cobra)</p>
            <AddrRow value={destinoOk ? destino : "Falta NEXT_PUBLIC_POLLAR_DESTINO"} onCopy={() => destinoOk && copyAddr(destino)} />
            {sameWallet && (
              <p className="text-xs leading-5 text-dim">
                Destino = tu misma G. Sirve para dejar un hash. Igual hace falta saldo.
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Stat k="XLM" v={snap.exists ? snap.xlm.toFixed(2) : "—"} />
              <Stat k="USDC" v={snap.exists ? snap.usdc.toFixed(2) : "—"} />
            </div>
            <p className="text-[11px] text-dim">
              Saldo leído en Horizon, no en el widget de Pollar.{" "}
              {payer && (
                <a href={stellarExpertAccount(payer)} target="_blank" rel="noreferrer" className="text-accent underline">
                  Ver cuenta
                </a>
              )}
              {!verified && " · Confirmando sesión…"}
            </p>
          </div>
        )}

        {isAuthenticated && !mainnet && (
          <button
            type="button"
            disabled={sending || !payer}
            onClick={fundXlm}
            className="btn mt-5 w-full border border-line bg-soft text-ink disabled:opacity-40"
          >
            {busy === "fund" ? "Pidiendo XLM…" : "Pedir XLM de prueba"}
          </button>
        )}

        {mainnet && !POLLAR_MAINNET_ARMED && (
          <p className="mt-3 text-xs text-accent">Armá mainnet en .env cuando toque gastar el USDC real.</p>
        )}

        <button
          type="button"
          disabled={!isAuthenticated || sending || !canPayMainnet || !destinoOk || (mainnet && !!hash)}
          onClick={payUsdc}
          className="btn mt-3 w-full bg-accent text-canvas disabled:opacity-40"
        >
          {busy === "usdc" ? "Armando USDC…" : "Pagar 1 USDC"}
        </button>
        {!mainnet && (
          <button
            type="button"
            disabled={!isAuthenticated || sending || !destinoOk}
            onClick={payXlm}
            className="btn mt-2 w-full border border-line bg-ink text-canvas disabled:opacity-40"
          >
            {busy === "xlm" ? "Enviando XLM…" : "Pagar 1 XLM (camino que cierra)"}
          </button>
        )}
        {note && <p className="mt-3 text-xs text-num">{note}</p>}
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </div>

      <label className="mt-6 block text-[11px] font-semibold uppercase tracking-[0.16em] text-dim">
        Hash de la tx Pollar
        <input
          value={hash}
          onChange={(e) => persist(e.target.value.trim())}
          placeholder="aparece acá cuando la rampa cierra"
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
            className="mt-2 inline-flex items-center gap-1 text-xs text-dim underline"
          >
            Stellar Expert <ExternalLink size={12} />
          </a>
        </div>
      )}

      {hasKey && (
        <p className="mt-6 text-sm leading-6 text-dim">
          Unlock ya te dejó pasar. Eso es la llave EVM, no el recibo Pollar.{" "}
          <Link href="/portal" className="font-medium text-accent underline underline-offset-4">
            Entrar a la sala
          </Link>
        </p>
      )}
    </div>
  );
}

function AddrRow({ value, onCopy }: { value: string; onCopy: () => void }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl bg-soft px-3 py-2">
      <p className="min-w-0 flex-1 break-all font-mono text-[11px] text-ink">{value}</p>
      <button type="button" onClick={onCopy} className="shrink-0 text-dim hover:text-ink" aria-label="Copiar">
        <Copy size={14} />
      </button>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-soft px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-dim">{k}</p>
      <p className="font-num text-lg text-num">{v}</p>
    </div>
  );
}

function describePayError(result: Extract<SubmitOutcome, { status: "error" }>, tx: TransactionState): string {
  const extra = tx.step === "error" ? [tx.details, tx.message, tx.code] : [];
  const blob = [result.details, result.message, result.code, result.resultCode, ...extra]
    .filter(Boolean)
    .join(" · ");
  const t = blob.toLowerCase();
  if (t.includes("underfund") || t.includes("insufficient") || t.includes("op_underfunded")) {
    return "Horizon dice underfunded. Pedí XLM de prueba y usá el botón de 1 XLM.";
  }
  if (t.includes("no_trust") || t.includes("trustline") || t.includes("op_no_trust")) {
    return "Falta trustline USDC. Reintentá: primero abrimos la línea, después el pago.";
  }
  return blob || "Pago falló.";
}
