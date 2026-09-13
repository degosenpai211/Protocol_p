"use client";

import dynamic from "next/dynamic";
import { ModuleWait } from "@/components/ModuleWait";

export const StudioClient = dynamic(() => import("@/components/Studio").then((m) => m.Studio), {
  ssr: false,
  loading: () => <ModuleWait />,
});
