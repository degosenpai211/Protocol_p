"use client";

import dynamic from "next/dynamic";

export const WalletBarLazy = dynamic(() => import("@/components/WalletBar").then((m) => m.WalletBar), {
  ssr: false,
  loading: () => <div className="h-10 w-28 rounded-full bg-soft" />,
});
