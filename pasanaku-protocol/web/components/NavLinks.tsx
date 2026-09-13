"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/join", label: "Unirse" },
  { href: "/portal", label: "Sala" },
  { href: "/app", label: "Estudio" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-7 text-[14px] text-dim">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          prefetch
          className={`transition hover:text-ink ${pathname === l.href ? "text-ink" : ""}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
