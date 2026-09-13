import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";
import { WalletBarLazy } from "@/components/WalletBarLazy";

export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Link href="/" prefetch className="flex items-center gap-3">
          <span className="grid grid-cols-2 gap-0.5">
            <i className="h-2 w-2 rounded-full bg-accent" />
            <i className="h-2 w-2 rounded-full bg-num" />
            <i className="h-2 w-2 rounded-full bg-ink" />
            <i className="h-2 w-2 rounded-full bg-accent/50" />
          </span>
          <span>
            <span className="block font-display text-[17px] font-semibold leading-none tracking-tight">
              riel
            </span>
            <span className="mt-1 block text-[9px] uppercase tracking-[0.22em] text-dim">pasanaku</span>
          </span>
        </Link>
        <NavLinks />
        <WalletBarLazy />
      </div>
    </header>
  );
}
