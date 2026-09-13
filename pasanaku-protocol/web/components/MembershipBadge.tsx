"use client";

import { useUnlockKey } from "@/lib/useUnlockKey";

export function MembershipBadge() {
  const { hasKey, isConnected, configured } = useUnlockKey();

  if (!configured || !isConnected || hasKey === null) return null;
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
        hasKey ? "bg-soft text-num" : "border border-line text-dim"
      }`}
    >
      {hasKey ? "Llave" : "Sin llave"}
    </span>
  );
}
