"use client";

import { useEffect } from "react";

export function HideDevChrome() {
  useEffect(() => {
    const error = console.error.bind(console);
    const warn = console.warn.bind(console);
    const noisy = (args: unknown[]) => {
      const text = args.map((a) => (typeof a === "string" ? a : "")).join(" ");
      return text.includes("PollarClient") || text.includes("[Fast Refresh]");
    };
    console.error = (...args: unknown[]) => {
      if (noisy(args)) return;
      error(...args);
    };
    console.warn = (...args: unknown[]) => {
      if (noisy(args)) return;
      warn(...args);
    };
    return () => {
      console.error = error;
      console.warn = warn;
    };
  }, []);

  return null;
}
