import Link from "next/link";
import { ArrowRight, KeyRound, Landmark, Radio, Waypoints } from "lucide-react";

const NAMES = [
  "Pasanaku · Bolivia",
  "Tanda · México",
  "Junta · Perú",
  "Susu · Ghana",
  "Stokvel · Sudáfrica",
  "Hui · China",
  "Paluwagan · Filipinas",
  "Cundina · Colombia",
  "Quiniela · Argentina",
  "Partner · Jamaica",
];

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-[78vh] overflow-hidden border-b border-line">
        <img
          src="/circle-diaspora.jpg"
          alt="Círculo de la diáspora"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/85 to-canvas/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-canvas/40" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-page flex-col justify-end px-6 pb-16 pt-24 sm:px-8 sm:pb-20">
          <p className="kicker rise">túnel · ahorro colaborativo</p>
          <p className="rise mt-6 font-display text-6xl font-semibold leading-[0.86] tracking-tight sm:text-8xl">
            <span className="text-ink">rie</span>
            <span className="text-accent">l</span>
          </p>
          <h1 className="rise mt-8 max-w-xl font-display text-[2.15rem] font-semibold leading-[1.12] sm:text-[2.7rem]">
            El mismo pozo. Distintos nombres.
          </h1>
          <p className="rise mt-4 max-w-lg font-serif text-[1.55rem] italic leading-snug text-ink/75">
            Pasanaku, tanda, susu, junta. El contrato solo guarda las reglas.
          </p>
          <p className="rise mt-5 max-w-md text-[15.5px] leading-7 text-dim">
            No somos el banco del círculo. Somos el riel: membresía, llave y pozo on-chain. La
            wallet firma. El dinero no pasa por nosotros.
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3">
            <Link href="/app" className="btn bg-accent text-canvas">
              Estudio <ArrowRight size={16} />
            </Link>
            <Link href="/join" className="btn border border-line bg-card/80 backdrop-blur">
              Activar gremio
            </Link>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-line bg-card/40 py-3">
        <div className="marquee-track text-[12px] uppercase tracking-[0.18em] text-dim">
          {[...NAMES, ...NAMES].map((n, i) => (
            <span key={`${n}-${i}`}>{n}</span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-page px-6 pb-24 pt-16 sm:px-8">
        <section className="rise-2">
          <p className="kicker">El círculo es viejo</p>
          <h2 className="mt-2 max-w-xl font-display text-[1.85rem] font-semibold leading-tight">
            Gremios que se prestan sin banco, de La Paz a Accra.
          </h2>
          <div className="mt-8 grid gap-3 lg:grid-cols-12 lg:grid-rows-2">
            <Place
              src="/circle-bolivia.jpg"
              place="Bolivia"
              name="Pasanaku"
              className="min-h-[22rem] lg:col-span-7 lg:row-span-2"
            />
            <Place
              src="/circle-mexico.jpg"
              place="México"
              name="Tanda"
              className="min-h-[13rem] lg:col-span-5"
            />
            <Place
              src="/circle-ghana.jpg"
              place="Ghana"
              name="Susu"
              className="min-h-[13rem] lg:col-span-5"
            />
          </div>
        </section>

        <section className="mt-20 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="kicker">Tres rieles</p>
            <h2 className="mt-2 font-display text-[1.75rem] font-semibold leading-tight">
              Sin puente. Cada uno hace lo suyo.
            </h2>
            <aside className="glow mt-6 rounded-[22px] border border-line bg-card p-5">
              <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-dim">
                <Waypoints size={14} className="text-accent" />
                @pasanaku/sdk
              </p>
              <pre className="snippet mt-4 overflow-x-auto">
{`await riel.join(id)
await riel.contribute(id)
await riel.claim(id)`}
              </pre>
            </aside>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:col-span-8">
            <BuyStep Icon={Radio} n="01" t="Pollar" d="1 USDC en Stellar activa el gremio. No entra al pozo." />
            <BuyStep Icon={KeyRound} n="02" t="Unlock" d="Key en C-Chain. Abre /portal y el join() del contrato." />
            <BuyStep Icon={Landmark} n="03" t="Avalanche" d="Colateral, cuotas, seguro, leave, aporte por otro." />
          </div>
        </section>

        <section className="mt-16 grid items-start gap-10 lg:grid-cols-12">
          <figure className="lg:col-span-5">
            <img src="/gremio-pozo.png" alt="Pozo del gremio" className="photo h-64 w-full" />
            <figcaption className="mt-3 text-sm text-dim">El pozo queda en el contrato. Pollar no toca esto.</figcaption>
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
      </div>
    </main>
  );
}

function Place({
  src,
  place,
  name,
  className,
}: {
  src: string;
  place: string;
  name: string;
  className?: string;
}) {
  return (
    <figure className={`relative overflow-hidden rounded-[22px] ${className ?? ""}`}>
      <img src={src} alt={`${name} en ${place}`} className="absolute inset-0 h-full w-full object-cover" />
      <div className="photo-veil absolute inset-0" />
      <figcaption className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/70">{place}</p>
        <p className="font-display text-2xl font-semibold">{name}</p>
      </figcaption>
    </figure>
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
