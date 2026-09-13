import { StudioClient } from "@/components/StudioClient";

export default function AppPage() {
  return (
    <main className="mx-auto max-w-page px-8 pb-24 pt-16">
      <div className="rise mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">estudio</p>
        <h1 className="mt-3 text-4xl font-semibold">Círculo</h1>
        <p className="mt-3 max-w-md font-serif text-xl italic text-ink/70">A cobra. B y C aportan.</p>
        <p className="mt-2 max-w-lg text-sm leading-6 text-dim">
          Estados: pending / stale / vivo / cerrado. Salir si no arranca. Aportar por un hermano. El default no traba el claim.
        </p>
        <p className="mt-2 text-xs text-dim">vía @pasanaku/sdk</p>
      </div>
      <StudioClient />
    </main>
  );
}
