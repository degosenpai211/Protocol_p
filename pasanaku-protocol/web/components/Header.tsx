import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { NavLinks } from "@/components/NavLinks";
import { WalletBarLazy } from "@/components/WalletBarLazy";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-page items-center justify-between gap-3 px-6 py-3.5 sm:gap-4 sm:px-8 sm:py-4">
        <Link href="/" prefetch className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-display text-[15px] font-semibold tracking-tight">riel</span>
        </Link>
        <NavLinks />
        <WalletBarLazy />
      </div>
    </header>
  );
}
