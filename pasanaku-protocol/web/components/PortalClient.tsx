"use client";

import dynamic from "next/dynamic";
import { ModuleWait } from "@/components/ModuleWait";

export const PortalClient = dynamic(
  () => import("@/components/PortalScreen").then((m) => m.PortalScreen),
  {
    ssr: false,
    loading: () => <ModuleWait />,
  },
);
