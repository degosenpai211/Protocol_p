"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useUnlockKey } from "@/lib/useUnlockKey";
import { ModuleWait } from "@/components/ModuleWait";

export function UnlockGate({
  children,
  wall,
}: {
  children: ReactNode;
  wall?: ReactNode;
}) {
  const { hasKey, isConnected, configured, isLoading } = useUnlockKey();

  if (configured && isConnected && isLoading) return <ModuleWait />;

  const blocked = !configured || !isConnected || hasKey !== true;
  if (!blocked) return <>{children}</>;
  if (wall) return <>{wall}</>;
  return <DefaultWall connected={isConnected} configured={configured} hasKey={hasKey} />;
}

function DefaultWall({
  connected,
  configured,
  hasKey,
}: {
  connected: boolean;
  configured: boolean;
  hasKey: boolean | null;
}) {
  let title = "Solo miembros";
  let body = "Esta sala es token-gated. Unlock tiene que decir sí.";
  if (!configured) {
    title = "Sin candado";
    body = "Falta el lock en el entorno.";
  } else if (!connected) {
    title = "Conectá";
    body = "Sin billetera no leemos la Key.";
  } else if (hasKey === false) {
    title = "Sin llave";
    body = "Pagá 1 USDC en Unirse. Después Unlock abre esto.";
  }

  return (
    <div className="relative min-h-[70vh]">
      <div className="pointer-events-none select-none blur-[7px] opacity-45" aria-hidden>
        <GhostPortal />
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="glow rise w-full max-w-md overflow-hidden rounded-[22px] border border-line bg-card/95 backdrop-blur-md">
          <img src="/gremio-taller.png" alt="" className="photo h-36 w-full rounded-none" />
          <div className="p-8 text-center sm:p-10">
            <p className="kicker">Unlock</p>
            <h1 className="mt-4 font-display text-3xl font-semibold">{title}</h1>
            <p className="mt-3 text-[15px] leading-7 text-dim">{body}</p>
            <p className="mt-5 font-serif text-xl italic text-ink/70">1 USDC · Key · reglamento.</p>
            <Link href="/join" className="btn mt-8 bg-ink text-canvas">
              Ir a pagar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function GhostPortal() {
  return (
    <div className="pb-8">
      <p className="font-display text-5xl font-semibold">Sala del gremio</p>
      <p className="mt-3 font-serif text-2xl italic">Solo con Key.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="h-40 rounded-[22px] bg-card" />
        <div className="h-40 rounded-[22px] bg-card" />
      </div>
      <div className="mt-4 h-56 rounded-[22px] bg-card" />
    </div>
  );
}

export { useUnlockKey } from "@/lib/useUnlockKey";
