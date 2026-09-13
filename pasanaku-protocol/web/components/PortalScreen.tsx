"use client";

import { UnlockGate } from "@/components/UnlockGate";
import { PortalBody } from "@/components/PortalBody";

export function PortalScreen() {
  return (
    <UnlockGate>
      <PortalBody />
    </UnlockGate>
  );
}
