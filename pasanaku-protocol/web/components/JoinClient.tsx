"use client";

import dynamic from "next/dynamic";
import { PaySkeleton } from "@/components/ModuleWait";

export const JoinClient = dynamic(() => import("@/components/JoinFlow").then((m) => m.JoinFlow), {
  ssr: false,
  loading: () => <PaySkeleton />,
});
