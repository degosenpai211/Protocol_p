"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { protocolAbi } from "@/lib/abi";
import { PROTOCOL_ADDRESS, UNLOCK_LOCK } from "@/lib/chain";
import { phaseCopy, phaseLabel } from "@/lib/phase";

function short(addr?: string) {
  if (!addr || addr.length < 10) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function PortalBody() {
  const { address } = useAccount();
  const configured = PROTOCOL_ADDRESS?.length === 42;
  const { data: score } = useReadContract({
    address: PROTOCOL_ADDRESS,
    abi: protocolAbi,
    functionName: "score",
    args: address ? [address] : undefined,
    query: { enabled: configured && !!address },
  });
  const { data: insurance } = useReadContract({
    address: PROTOCOL_ADDRESS,
    abi: protocolAbi,
    functionName: "insuranceFund",
    query: { enabled: configured },
  });
  const { data: phaseN } = useReadContract({
    address: PROTOCOL_ADDRESS,
    abi: protocolAbi,
    functionName: "phase",
    args: [0n],
    query: { enabled: configured },
  });
  const rep = score?.toString() ?? "0";
  const seguro = insurance ? Number(formatEther(insurance)).toFixed(2) : "0.00";
  const estado = phaseLabel(phaseN);

  return (
    <div className="rise">
      <section className="grid items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-num">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-num" />
            Key válida · Unlock
          </p>
          <h1 className="mt-7 font-display text-[2.75rem] font-semibold leading-[1.05] sm:text-6xl">Sala del gremio</h1>
          <p className="mt-5 max-w-xl font-serif text-[1.85rem] italic leading-snug text-ink/80">
            Acá se lee lo que el contrato no explica en una tx.
          </p>
          <p className="mt-5 max-w-xl text-[17px] leading-7 text-dim">
            Esta página es el portal token-gated. Sin Key de Unlock no existe. Adentro: reglamento,
            reputación, seguro y cómo se parte el 6%. El pozo no pasa por nosotros.
          </p>
        </div>
        <figure className="lg:col-span-5">
          <img
            src="/gremio-taller.png"
            alt="Taller del gremio"
            className="h-64 w-full rounded-[28px] object-cover sm:h-80"
          />
          <figcaption className="mt-3 text-sm text-dim">El círculo es gente conocida. La llave es on-chain.</figcaption>
        </figure>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-12">
        <article className="glow rounded-[28px] border border-line bg-card p-7 md:col-span-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-dim">Reputación</p>
          <p className="font-num mt-4 text-6xl text-num">{rep.padStart(2, "0")}</p>
          <p className="mt-3 text-[15px] leading-6 text-dim">
            Sube +1 cuando el círculo cierra limpio. Baja si hay default. Es tu historial en el riel,
            no un like.
          </p>
        </article>
        <article className="glow rounded-[28px] border border-line bg-card p-7 md:col-span-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-dim">Seguro</p>
          <p className="font-num mt-4 text-6xl text-num">{seguro}</p>
          <p className="mt-3 text-[15px] leading-6 text-dim">
            Recorte 0,30% de cada pozo. Si alguien no paga, cubre el hueco. El organizer no puede
            vaciarlo.
          </p>
        </article>
        <article className="glow rounded-[28px] border border-line bg-card p-7 md:col-span-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-dim">Estado · círculo 0</p>
          <p className="mt-4 font-display text-2xl font-semibold capitalize">{estado}</p>
          <p className="mt-3 text-[15px] leading-6 text-dim">{phaseCopy(phaseN)}</p>
        </article>
        <article className="glow rounded-[28px] border border-line bg-card p-7 md:col-span-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-dim">Membresía</p>
          <p className="mt-4 font-display text-2xl font-semibold">Unlock Key</p>
          <p className="mt-3 text-[15px] leading-6 text-dim">
            ERC-721 en C-Chain. Precio 0: el cobro lo hace Pollar (1 USDC). join() también la pide.
          </p>
          <a
            href={`https://snowtrace.io/address/${UNLOCK_LOCK}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block font-mono text-xs text-accent underline underline-offset-4"
          >
            {short(UNLOCK_LOCK)}
          </a>
        </article>
      </section>

      <section className="mt-16 grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Compra / activación</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">1 USDC, no el pozo</h2>
          <p className="mt-4 text-[16px] leading-7 text-dim">
            Pollar cobra <strong className="font-medium text-ink">1 USDC en Stellar</strong> para
            activar el gremio. Ese dólar no entra al pasanaku. Después te grantan la Key Unlock y esta
            sala se abre. El colateral y las cuotas van al contrato en Fuji.
          </p>
          <ol className="mt-6 space-y-4">
            <Step n="1" t="Unirse" d="Google en Pollar. Pago 1 USDC (testnet ahora, mainnet una vez)." />
            <Step n="2" t="Key" d="Unlock en Avalanche C-Chain. Sin ella, muro." />
            <Step n="3" t="Círculo" d="Mint mUSDC, aprobar, join, aportar o cobrar." />
          </ol>
          <Link href="/join" className="btn mt-8 bg-ink text-white">
            Ir a pagar
          </Link>
        </div>
        <figure className="lg:col-span-6">
          <img
            src="/gremio-pozo.png"
            alt="Pozo compartido"
            className="h-72 w-full rounded-[28px] object-cover"
          />
        </figure>
      </section>

      <section className="mt-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Comparativa</p>
        <h2 className="mt-2 font-display text-3xl font-semibold">Quién cobra qué</h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-7 text-dim">
          En crédito, el del turno no aporta esa semana. Fee 1% + seguro 0,30%. Los primeros dejan un
          recorte al bono del último (~6% de un pozo, repartido).
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Compare
            n="01"
            t="Primero"
            d="Cobra ya. Se lleva el pozo menos recortes. No espera 30 semanas. Paga el 6% con los demás tempranos."
            bars={[
              { k: "Pozo neto", w: "78%" },
              { k: "Fee + seguro", w: "13%" },
              { k: "Bono último", w: "9%" },
            ]}
          />
          <Compare
            n="30"
            t="Último"
            d="Espera. Recibe pozo + el bono acumulado + colateral de vuelta + score. Por eso el paciente gana."
            bars={[
              { k: "Pozo neto", w: "87%" },
              { k: "Bono ~6%", w: "100%" },
              { k: "Colateral", w: "100%" },
            ]}
            last
          />
        </div>
      </section>

      <section className="mt-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Reglamento</p>
        <h2 className="mt-2 font-display text-3xl font-semibold">Cómo entra y sale la plata</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-2">
          <Rule
            n="01"
            t="Colateral chico"
            d="2–3 cuotas, no toda la deuda. Queda trabado hasta el cierre limpio. Si default, se usa para cubrir al del turno."
          />
          <Rule
            n="02"
            t="Sin llave, no entra"
            d="getHasValidKey tiene que ser true. El muro de esta sala y el join() del contrato miran lo mismo."
          />
          <Rule
            n="03"
            t="Bono ~6%"
            d="No es yield de Aave. Es recorte de los que cobran antes. El último lo recibe entero al claim final."
          />
          <Rule
            n="04"
            t="Recover"
            d="Si el círculo se congela 7 días, cada uno saca su colateral. Nadie tiene withdrawAll."
          />
        </ol>
      </section>

      <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-line pt-10">
        <Link href="/app" className="btn bg-accent text-white">
          Ir al estudio
        </Link>
        <p className="max-w-md text-sm leading-6 text-dim">
          Pozo en Fuji. Llave en C-Chain. Pollar en Stellar. Tres rieles, sin puente.
        </p>
      </div>
    </div>
  );
}

function Step({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <li className="grid grid-cols-[2rem_1fr] gap-3">
      <span className="font-num text-xl text-num">{n}</span>
      <div>
        <p className="font-medium">{t}</p>
        <p className="text-sm leading-6 text-dim">{d}</p>
      </div>
    </li>
  );
}

function Rule({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <li className="rounded-[24px] border border-line bg-card p-6 transition duration-300 hover:-translate-y-0.5">
      <span className="font-num text-3xl text-num">{n}</span>
      <h3 className="mt-3 font-display text-xl font-semibold">{t}</h3>
      <p className="mt-2 text-[15px] leading-7 text-dim">{d}</p>
    </li>
  );
}

function Compare({
  n,
  t,
  d,
  bars,
  last,
}: {
  n: string;
  t: string;
  d: string;
  bars: { k: string; w: string }[];
  last?: boolean;
}) {
  return (
    <article className={`rounded-[28px] border border-line p-7 ${last ? "bg-mint" : "bg-card"}`}>
      <div className="flex items-baseline justify-between">
        <span className="font-num text-5xl text-num">{n}</span>
        <h3 className="font-display text-xl font-semibold">{t}</h3>
      </div>
      <p className="mt-4 text-[15px] leading-7 text-dim">{d}</p>
      <ul className="mt-6 space-y-3">
        {bars.map((b) => (
          <li key={b.k}>
            <div className="mb-1 flex justify-between text-xs text-dim">
              <span>{b.k}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/80">
              <div className="rule-bar h-full rounded-full bg-num" style={{ width: b.w }} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
