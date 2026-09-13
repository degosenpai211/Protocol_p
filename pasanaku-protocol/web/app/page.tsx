import Link from "next/link";
import { ArrowRight, KeyRound, Landmark, Radio, Waypoints } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-page px-6 pb-24 pt-14 sm:px-8">
      <section className="relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="rise relative lg:col-span-6">
          <p className="kicker">túnel · pasanaku on-chain</p>
          <p className="mt-8 font-display text-6xl font-semibold leading-[0.88] tracking-tight sm:text-8xl">
            <span className="text-ink">rie</span>
            <span className="text-accent">l</span>
          </p>
          <h1 className="mt-8 max-w-md font-display text-[2.05rem] font-semibold leading-[1.15] sm:text-[2.4rem]">
            El pozo queda en el contrato.
          </h1>
          <p className="mt-4 max-w-md font-serif text-[1.55rem] italic leading-snug text-ink/70">
            Pollar abre. Unlock deja pasar. Fuji guarda.
          </p>
          <p className="mt-5 max-w-md text-[15.5px] leading-7 text-dim">
            No somos el banco del círculo. Somos el riel: membresía, llave y reglas. Cualquier
            app llama el SDK; la wallet firma.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/app" className="btn bg-accent text-canvas">
              Estudio <ArrowRight size={16} />
            </Link>
            <Link href="/join" className="btn border border-line bg-card">
              Activar gremio
            </Link>
          </div>
        </div>

        <div className="rise-2 lg:col-span-6">
          <img src="/gremio-taller.png" alt="Gremio" className="photo h-52 w-full sm:h-60" />
          <aside className="glow mt-4 rounded-[22px] border border-line bg-card p-6">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-dim">
              <Waypoints size={14} className="text-accent" />
              @pasanaku/sdk
            </p>
            <pre className="snippet mt-4 overflow-x-auto">
{`const riel = createPasanaku({ … })
await riel.join(id)
await riel.contribute(id)
await riel.claim(id)`}
            </pre>
            <p className="mt-5 text-sm leading-6 text-dim">
              Sin Key Unlock, <span className="font-mono text-ink">join()</span> revierte. El
              pozo no cruza Stellar.
            </p>
          </aside>
        </div>
      </section>

      <section className="mt-20 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="kicker">Tres rieles</p>
          <h2 className="mt-2 font-display text-[1.75rem] font-semibold leading-tight">
            Sin puente. Cada uno hace lo suyo.
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-8">
          <BuyStep Icon={Radio} n="01" t="Pollar" d="1 USDC en Stellar activa el gremio. No entra al pozo." />
          <BuyStep Icon={KeyRound} n="02" t="Unlock" d="Key en C-Chain. Abre /portal y el join() del contrato." />
          <BuyStep Icon={Landmark} n="03" t="Fuji" d="Colateral, cuotas, seguro, leave, aporte por otro." />
        </div>
      </section>

      <section className="mt-16 grid items-start gap-10 lg:grid-cols-12">
        <figure className="lg:col-span-5">
          <img src="/gremio-pozo.png" alt="Pozo" className="photo h-64 w-full" />
          <figcaption className="mt-3 text-sm text-dim">Fuji guarda. Pollar no toca esto.</figcaption>
        </figure>
        <div className="lg:col-span-7">
          <p className="kicker">Reglamento</p>
          <h2 className="mt-2 font-display text-[1.75rem] font-semibold">Cómo se parte una ronda</h2>
          <p className="mt-4 max-w-xl text-[15.5px] leading-7 text-dim">
            Crédito: el del turno no aporta. Fee 1% + seguro 0,30%. Los que cobran antes dejan un
            recorte (~6%) al que cierra. No es yield de vault.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <CompareMini n="01" t="Primero" bars={["78%", "13%", "9%"]} labels={["Pozo", "Fee+seguro", "Bono"]} />
            <CompareMini n="cierra" t="Último" mint bars={["87%", "100%", "100%"]} labels={["Pozo", "Bono", "Colateral"]} />
          </div>
        </div>
      </section>
    </main>
  );
}

function BuyStep({
  Icon,
  n,
  t,
  d,
}: {
  Icon: typeof KeyRound;
  n: string;
  t: string;
  d: string;
}) {
  return (
    <article className="rounded-[22px] border border-line bg-card p-5">
      <Icon size={18} className="text-accent" strokeWidth={1.7} />
      <span className="mt-4 block font-num text-xl text-num">{n}</span>
      <h3 className="mt-1 font-display text-base font-semibold">{t}</h3>
      <p className="mt-1.5 text-[13.5px] leading-6 text-dim">{d}</p>
    </article>
  );
}

function CompareMini({
  n,
  t,
  bars,
  labels,
  mint,
}: {
  n: string;
  t: string;
  bars: string[];
  labels: string[];
  mint?: boolean;
}) {
  return (
    <article className={`rounded-[22px] border border-line p-5 ${mint ? "bg-mint" : "bg-card"}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-num text-3xl text-num">{n}</span>
        <h3 className="font-display text-sm font-semibold">{t}</h3>
      </div>
      <ul className="mt-4 space-y-2.5">
        {bars.map((w, i) => (
          <li key={labels[i]}>
            <p className="mb-1 text-[11px] text-dim">{labels[i]}</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-canvas/60">
              <div className="rule-bar h-full rounded-full bg-num" style={{ width: w }} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
