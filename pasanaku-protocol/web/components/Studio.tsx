"use client";

import { useMemo, useState } from "react";
import { formatEther, parseEther, maxUint256, type Address } from "viem";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { protocolAbi, tokenAbi } from "@/lib/abi";
import { PROTOCOL_ADDRESS, TOKEN_ADDRESS } from "@/lib/chain";
import { DEMO_MEMBERS } from "@/lib/demo";
import { useUnlockKey } from "@/components/UnlockGate";
import { useRiel } from "@/lib/useRiel";

function short(addr?: string) {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function Studio() {
  const configured = PROTOCOL_ADDRESS?.length === 42 && TOKEN_ADDRESS?.length === 42;
  const { address, isConnected } = useAccount();
  const { hasKey, configured: lockOn } = useUnlockKey();
  const [circleId, setCircleId] = useState("0");
  const [members, setMembers] = useState(DEMO_MEMBERS.join("\n"));
  const [contrib, setContrib] = useState("5");
  const [collat, setCollat] = useState("10");
  const [mode, setMode] = useState<"0" | "1">("1");

  const id = BigInt(circleId || "0");

  const { data: core, refetch } = useReadContracts({
    allowFailure: true,
    query: { enabled: configured },
    contracts: [
      { address: PROTOCOL_ADDRESS, abi: protocolAbi, functionName: "getCircle", args: [id] },
      { address: PROTOCOL_ADDRESS, abi: protocolAbi, functionName: "insuranceFund" },
      { address: PROTOCOL_ADDRESS, abi: protocolAbi, functionName: "allPaid", args: [id] },
    ],
  });

  const circle = core?.[0]?.result;
  const insurance = core?.[1]?.result;
  const allPaid = core?.[2]?.result;

  const { data: mine } = useReadContracts({
    allowFailure: true,
    query: { enabled: configured && !!address },
    contracts: address
      ? [
          { address: PROTOCOL_ADDRESS, abi: protocolAbi, functionName: "score", args: [address] },
          { address: PROTOCOL_ADDRESS, abi: protocolAbi, functionName: "withdrawable", args: [address] },
          { address: PROTOCOL_ADDRESS, abi: protocolAbi, functionName: "hasJoined", args: [id, address] },
          { address: TOKEN_ADDRESS, abi: tokenAbi, functionName: "balanceOf", args: [address] },
        ]
      : [],
  });

  const score = mine?.[0]?.result;
  const withdrawable = mine?.[1]?.result;
  const joined = mine?.[2]?.result;
  const tokenBal = mine?.[3]?.result;

  const { data: recipient } = useReadContract({
    address: PROTOCOL_ADDRESS,
    abi: protocolAbi,
    functionName: "recipient",
    args: [id],
    query: { enabled: configured && circle ? !circle[6] : false },
  });

  const riel = useRiel();
  const { writeContract, data: tokenHash, isPending: tokenPending, error: tokenError } = useWriteContract();
  const [sdkHash, setSdkHash] = useState<`0x${string}`>();
  const [sdkErr, setSdkErr] = useState("");
  const [sdkBusy, setSdkBusy] = useState(false);
  const hash = sdkHash ?? tokenHash;
  const isPending = sdkBusy || tokenPending;
  const error = sdkErr ? { message: sdkErr } : tokenError;
  const { isLoading: confirming } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });

  const { data: paidFlags } = useReadContracts({
    contracts:
      circle && !circle[6]
        ? circle[0].map((m) => ({
            address: PROTOCOL_ADDRESS,
            abi: protocolAbi,
            functionName: "hasPaid" as const,
            args: [id, circle[3], m] as const,
          }))
        : [],
    query: { enabled: configured && !!circle && !circle[6] },
  });

  const parsed = useMemo(() => {
    if (!circle) return null;
    const [membersList, contribution, collateral, round, , modeN, finished, lateBonus] = circle;
    const n = BigInt(membersList.length);
    const pot = contribution * (modeN === 1 ? n - 1n : n);
    const targetBonus = (pot * 600n) / 10000n;
    return {
      membersList,
      contribution,
      collateral,
      round,
      modeN,
      finished,
      lateBonus,
      n,
      pot,
      targetBonus,
    };
  }, [circle]);

  async function runRiel(fn: () => Promise<`0x${string}`>) {
    if (!riel) return;
    setSdkErr("");
    setSdkBusy(true);
    try {
      const h = await fn();
      setSdkHash(h);
      setTimeout(() => refetch(), 2500);
    } catch (e) {
      setSdkErr(e instanceof Error ? e.message : "tx falló");
    } finally {
      setSdkBusy(false);
    }
  }

  function runToken(fn: () => void) {
    fn();
    setTimeout(() => refetch(), 2500);
  }

  if (!configured) {
    return (
      <div className="rise rounded-[28px] border border-dashed border-line bg-card p-8">
        <h2 className="text-2xl font-semibold">Sin riel</h2>
        <p className="mt-2 text-sm text-dim">Pegá las direcciones en .env.local</p>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-soft p-4 text-xs text-dim">
{`NEXT_PUBLIC_PROTOCOL_ADDRESS=
NEXT_PUBLIC_TOKEN_ADDRESS=`}
        </pre>
      </div>
    );
  }

  return (
    <div className="rise grid gap-5 lg:grid-cols-2">
      <section className="glow rounded-[28px] border border-line bg-card p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">nuevo</p>
        <h2 className="mt-1 text-xl font-semibold">Círculo</h2>

        <textarea
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          rows={3}
          className="input mt-5 font-mono text-xs"
        />

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Cuota" value={contrib} onChange={setContrib} />
          <Field label="Colateral" value={collat} onChange={setCollat} />
        </div>

        <div className="mt-3 flex gap-2">
          <ModeChip active={mode === "1"} onClick={() => setMode("1")} label="Crédito" />
          <ModeChip active={mode === "0"} onClick={() => setMode("0")} label="Ahorro" />
        </div>

        <button
          disabled={!isConnected || isPending || !riel}
          onClick={() =>
            runRiel(() =>
              riel!.createCircle(
                members
                  .split(/\s+/)
                  .map((x) => x.trim())
                  .filter(Boolean) as Address[],
                parseEther(contrib || "0"),
                parseEther(collat || "0"),
                Number(mode) as 0 | 1,
              ),
            )
          }
          className="btn mt-5 w-full bg-accent text-white disabled:opacity-40"
        >
          Crear
        </button>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Stat k="Rep" v={score?.toString() ?? "0"} />
          <Stat k="mUSDC" v={tokenBal ? Number(formatEther(tokenBal)).toFixed(0) : "—"} />
          <Stat k="Seguro" v={insurance ? Number(formatEther(insurance)).toFixed(1) : "0"} />
        </div>

        <div className="mt-3 flex gap-2">
          <button
            disabled={!isConnected}
            onClick={() =>
              runToken(() =>
                writeContract({
                  address: TOKEN_ADDRESS,
                  abi: tokenAbi,
                  functionName: "mint",
                  args: [address!, parseEther("500")],
                }),
              )
            }
            className="btn flex-1 border border-line bg-card text-ink"
          >
            +500
          </button>
          <button
            disabled={!isConnected}
            onClick={() =>
              runToken(() =>
                writeContract({
                  address: TOKEN_ADDRESS,
                  abi: tokenAbi,
                  functionName: "approve",
                  args: [PROTOCOL_ADDRESS, maxUint256],
                }),
              )
            }
            className="btn flex-1 border border-line bg-card text-ink"
          >
            Aprobar
          </button>
        </div>
      </section>

      <section className="glow rounded-[28px] border border-line bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-num">vivo</p>
            <h2 className="mt-1 text-xl font-semibold">Bono</h2>
          </div>
          <input
            value={circleId}
            onChange={(e) => setCircleId(e.target.value.replace(/[^\d]/g, ""))}
            className="font-num w-16 rounded-full border border-line bg-soft px-2 py-2 text-center text-num outline-none focus:border-accent"
          />
        </div>

        {parsed ? (
          <>
            <p className="mt-4 text-sm text-dim">
              {parsed.finished ? "Cerrado" : `${parsed.round + 1n}/${parsed.n}`} ·{" "}
              {parsed.modeN === 1 ? "crédito" : "ahorro"} · {short(recipient)}
            </p>

            <div className="mt-5">
              <div className="flex justify-between text-xs text-dim">
                <span>Último</span>
                <span className="font-num text-num">
                  {Number(formatEther(parsed.lateBonus)).toFixed(2)} /{" "}
                  {Number(formatEther(parsed.targetBonus)).toFixed(2)}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-soft">
                <div
                  className="rule-bar h-full rounded-full bg-num"
                  style={{
                    width: `${parsed.targetBonus === 0n ? 0 : Math.min(100, Number((parsed.lateBonus * 100n) / parsed.targetBonus))}%`,
                  }}
                />
              </div>
            </div>

            <ul className="mt-5 space-y-2">
              {parsed.membersList.map((m, i) => {
                const isLast = i === parsed.membersList.length - 1;
                const isTurn = !parsed.finished && parsed.round === BigInt(i);
                const paid = paidFlags?.[i]?.result === true;
                return (
                  <li
                    key={m}
                    className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm transition duration-300 ${
                      isTurn ? "bg-accent/10" : "bg-soft hover:bg-line/60"
                    }`}
                  >
                    <span className="font-mono text-xs">
                      <span className="font-num mr-2 text-num">{String(i + 1).padStart(2, "0")}</span>
                      {short(m)}
                      {m.toLowerCase() === address?.toLowerCase() ? " · tú" : ""}
                    </span>
                    <span className="flex items-center gap-2 text-xs font-medium">
                      <span className="text-num">
                        {paid ? "pagó" : isLast ? "cierra" : isTurn ? "cobra" : "espera"}
                      </span>
                      {parsed.modeN === 1 && !parsed.finished && !paid && !isTurn && (
                        <button
                          type="button"
                          disabled={!isConnected || isPending || !riel}
                          onClick={() => runRiel(() => riel!.markDefault(id, m))}
                          className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent hover:bg-accent/10 disabled:opacity-40"
                        >
                          Falla
                        </button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Action
                disabled={!isConnected || !!joined || (lockOn && hasKey !== true) || !riel}
                onClick={() => runRiel(() => riel!.join(id))}
              >
                {lockOn && hasKey !== true ? "Sin llave" : "Entrar"}
              </Action>
              <Action disabled={!isConnected || !riel} onClick={() => runRiel(() => riel!.contribute(id))}>
                Aportar
              </Action>
              <Action
                disabled={!isConnected || !allPaid || !riel}
                onClick={() => runRiel(() => riel!.claim(id))}
              >
                Cobrar
              </Action>
              <Action
                disabled={!isConnected || !withdrawable || !riel}
                onClick={() => runRiel(() => riel!.withdraw())}
              >
                Retirar
              </Action>
              <Action disabled={!isConnected || !riel} onClick={() => runRiel(() => riel!.recover(id))}>
                Recuperar
              </Action>
            </div>
          </>
        ) : (
          <p className="mt-8 text-dim">Creá un círculo.</p>
        )}

        {(isPending || confirming) && <p className="mt-4 text-xs text-num">Confirmando…</p>}
        {hash && (
          <a
            href={`https://testnet.snowtrace.io/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block font-mono text-xs text-dim underline"
          >
            {hash.slice(0, 10)}…
          </a>
        )}
        {error && <p className="mt-3 text-xs text-red-600">{error.message}</p>}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-dim">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input mt-2" />
    </label>
  );
}

function ModeChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
        active ? "bg-accent text-white" : "border border-line text-dim hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-soft px-2 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-dim">{k}</p>
      <p className="font-num mt-1 text-xl text-num">{v}</p>
    </div>
  );
}

function Action({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button disabled={disabled} onClick={onClick} className="btn bg-ink text-white disabled:opacity-35">
      {children}
    </button>
  );
}
