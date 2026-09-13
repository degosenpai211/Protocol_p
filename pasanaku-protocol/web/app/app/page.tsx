import { StudioClient } from "@/components/StudioClient";

export default function AppPage() {
  return (
    <main className="mx-auto max-w-page px-6 pb-24 pt-14 sm:px-8">
      <div className="rise mb-10">
        <p className="kicker">estudio · sdk</p>
        <h1 className="mt-4 font-display text-4xl font-semibold">Círculo</h1>
        <p className="mt-3 max-w-md font-serif text-xl italic text-ink/70">A cobra. B y C aportan.</p>
        <p className="mt-2 max-w-lg text-[15px] leading-6 text-dim">
          Pending, stale, vivo, cerrado. Salir si no arranca. Aportar por un hermano. El default no traba el claim.
        </p>
      </div>
      <StudioClient />
    </main>
  );
}
