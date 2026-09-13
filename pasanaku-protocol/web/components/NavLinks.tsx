"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DoorOpen, KeyRound, Layers } from "lucide-react";

const links = [
  { href: "/join", label: "Unirse", Icon: DoorOpen },
  { href: "/portal", label: "Sala", Icon: KeyRound },
  { href: "/app", label: "Estudio", Icon: Layers },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 text-[13.5px] text-dim sm:gap-2">
      {links.map((l) => {
        const on = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            prefetch
            className={`relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition hover:text-ink ${on ? "bg-soft text-ink" : ""}`}
          >
            <l.Icon size={14} strokeWidth={1.8} />
            <span className="hidden sm:inline">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
