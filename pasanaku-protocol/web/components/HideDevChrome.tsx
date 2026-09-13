"use client";

import { useEffect } from "react";

function hidePortals() {
  document.querySelectorAll("nextjs-portal").forEach((node) => {
    const el = node as HTMLElement;
    el.style.setProperty("display", "none", "important");
    el.style.setProperty("visibility", "hidden", "important");
    el.style.setProperty("pointer-events", "none", "important");
    el.setAttribute("aria-hidden", "true");
  });
}

export function HideDevChrome() {
  useEffect(() => {
    hidePortals();
    const observer = new MutationObserver(hidePortals);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    const error = console.error.bind(console);
    const warn = console.warn.bind(console);
    const noisy = (args: unknown[]) => {
      const text = args.map((a) => (typeof a === "string" ? a : "")).join(" ");
      return (
        text.includes("PollarClient") ||
        text.includes("nextjs-portal") ||
        text.includes("[Fast Refresh]")
      );
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
      observer.disconnect();
      console.error = error;
      console.warn = warn;
    };
  }, []);

  return null;
}
