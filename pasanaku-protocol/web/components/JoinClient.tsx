"use client";

import dynamic from "next/dynamic";
import { ModuleWait } from "@/components/ModuleWait";

export const JoinClient = dynamic(() => import("@/components/JoinFlow").then((m) => m.JoinFlow), {
  ssr: false,
  loading: () => <ModuleWait />,
});
