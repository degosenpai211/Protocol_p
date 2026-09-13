import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-page px-6 pb-28 pt-12 sm:px-8">
      <section className="grid items-center gap-12 lg:grid-cols-12">
        <div className="rise lg:col-span-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-dim">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-num" />
            Pasanaku · Fuji · USDC
          </p>

          <p className="mt-10 font-display text-6xl font-semibold leading-[0.88] tracking-tight sm:text-8xl">
            <span className="text-ink">rie</span>
            <span className="text-accent">l</span>
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.32em] text-dim">círculos de crédito</p>

          <h1 className="mt-10 max-w-lg font-display text-[2.35rem] font-semibold leading-[1.12] sm:text-[2.85rem]">
            El último cobra más. El primero deja el 6%.
          </h1>
          <p className="mt-5 max-w-lg font-serif text-[1.65rem] italic leading-snug text-ink/80">
            Cuotas on-chain. Sin custodia. La llave es Unlock.
          </p>
          <p className="mt-5 max-w-lg text-[16.5px] leading-7 text-dim">
            Un pasanaku no es un banco. Es un círculo: todos aportan, uno cobra por turno.
            Riel deja el pozo en el contrato, cobra 1 USDC por la membresía (Pollar) y pide
            Key Unlock para entrar a la sala.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/join" className="btn bg-ink px-6 text-white">
              Activar · 1 USDC
            </Link>
            <Link href="/portal" className="btn border border-line bg-card">
              Ver sala
            </Link>
          </div>
        </div>

        <div className="rise-2 lg:col-span-6">
          <img
            src="/gremio-taller.png"
            alt="Gremio alrededor de la mesa"
            className="mb-5 h-56 w-full rounded-[28px] object-cover sm:h-64"
          />
          <HeroCard />
        </div>
      </section>

      <section className="mt-24 grid gap-10 border-t border-line pt-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Compra</p>
          <h2 className="mt-2 font-display text-3xl font-semibold leading-tight">1 USDC abre el gremio. No el pozo.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-8">
          <BuyStep n="01" t="Pollar" d="Google, 1 USDC en Stellar. Ese dólar es membresía, no cuota." />
          <BuyStep n="02" t="Unlock" d="Key ERC-721 en C-Chain. Sin ella, muro en /portal y join() falla." />
          <BuyStep n="03" t="Fuji" d="Mint mUSDC, colateral, aportar o cobrar. El contrato guarda." />
        </div>
      </section>

      <section className="mt-20 grid items-center gap-10 lg:grid-cols-12">
        <figure className="lg:col-span-5">
          <img
            src="/gremio-pozo.png"
            alt="Pozo compartido del círculo"
            className="h-72 w-full rounded-[28px] object-cover"
          />
          <figcaption className="mt-3 text-sm text-dim">El pozo vive en Avalanche Fuji. Pollar no lo toca.</figcaption>
        </figure>
        <div className="lg:col-span-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Comparativa</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Primero vs último</h2>
          <p className="mt-4 max-w-xl text-[16.5px] leading-7 text-dim">
            En crédito, el del turno no aporta esa semana. Hay fee 1% y seguro 0,30%.
            Quienes cobran temprano dejan un recorte: eso arma el bono ~6% del que cierra.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <CompareMini n="01" t="Primero" bars={["78%", "13%", "9%"]} labels={["Pozo neto", "Fee+seguro", "Bono"]} />
            <CompareMini n="30" t="Último" mint bars={["87%", "100%", "100%"]} labels={["Pozo neto", "Bono ~6%", "Colateral"]} />
          </div>
        </div>
      </section>

      <section className="rise-3 mt-20 grid gap-10 border-t border-line pt-12 sm:grid-cols-3">
        <Note k="Custodia" t="Nadie puede withdrawAll. El contrato guarda el pozo y el colateral." />
        <Note k="Bono" t="No es yield. Es recorte de los que cobran antes, para quien espera." />
        <Note k="Tres rieles" t="Pollar (Stellar), Unlock (C-Chain), pozo (Fuji). Sin puente." />
      </section>
    </main>
  );
}

function HeroCard() {
  return (
    <aside className="glow relative rounded-[28px] border border-line bg-card p-6 sm:p-8">
      <span className="absolute -top-3 right-6 inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-[11px] font-medium text-white">
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-num" />
        ronda 0
      </span>

      <p className="text-[11px] uppercase tracking-[0.18em] text-dim">círculo demo</p>
      <p className="mt-2 font-display text-lg font-semibold">Crédito · 30 semanas</p>

      <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-dim">pozo</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <span className="font-num text-5xl text-num sm:text-6xl">01</span>
        <span className="font-num text-5xl text-num/35 sm:text-6xl">15</span>
        <span className="font-num text-5xl text-num sm:text-6xl">30</span>
      </div>
      <p className="mt-2 flex justify-between text-xs text-dim">
        <span>primero</span>
        <span>medio</span>
        <span>último</span>
      </p>

      <div className="mt-8 rounded-2xl bg-soft px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-dim">turnos</p>
        <ul className="mt-3 space-y-3">
          <Member letter="A" name="Organiza" tag="cobra" />
          <Member letter="B" name="Aporta" tag="–" />
          <Member letter="C" name="Cierra" tag="+6%" you />
        </ul>
      </div>
    </aside>
  );
}

function Member({
  letter,
  name,
  tag,
  you,
}: {
  letter: string;
  name: string;
  tag: string;
  you?: boolean;
}) {
  return (
    <li className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-3">
        <span
          className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold text-white ${
            you ? "bg-accent" : letter === "A" ? "bg-ink" : "bg-num"
          }`}
        >
          {letter}
        </span>
        <span>
          {name}
          {you ? " (tú)" : ""}
        </span>
      </span>
      <span className="text-dim">{tag}</span>
    </li>
  );
}

function Note({ k, t }: { k: string; t: string }) {
  return (
    <article>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{k}</p>
      <p className="mt-2 text-[16px] leading-7 text-dim">{t}</p>
    </article>
  );
}

function BuyStep({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <article className="rounded-[24px] border border-line bg-card p-5">
      <span className="font-num text-2xl text-num">{n}</span>
      <h3 className="mt-2 font-display text-lg font-semibold">{t}</h3>
      <p className="mt-2 text-sm leading-6 text-dim">{d}</p>
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
    <article className={`rounded-[24px] border border-line p-5 ${mint ? "bg-mint" : "bg-card"}`}>
      <div className="flex items-baseline justify-between">
        <span className="font-num text-4xl text-num">{n}</span>
        <h3 className="font-display font-semibold">{t}</h3>
      </div>
      <ul className="mt-5 space-y-3">
        {bars.map((w, i) => (
          <li key={labels[i]}>
            <p className="mb-1 text-xs text-dim">{labels[i]}</p>
            <div className="h-2 overflow-hidden rounded-full bg-white/80">
              <div className="rule-bar h-full rounded-full bg-num" style={{ width: w }} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
