export const DEMO_MEMBERS = [
  "0x32baA1d37eFcDB7df273afE743565E54aF1E6371",
  "0x3919FE68971c28466C761769a02020011086b85b",
  "0xB19d31205375D92b29BC8EA2A413C7411CF861D6",
] as const;

export function demoLetter(addr?: string) {
  if (!addr) return "";
  const i = DEMO_MEMBERS.findIndex((m) => m.toLowerCase() === addr.toLowerCase());
  return i === -1 ? "" : (["A", "B", "C"] as const)[i];
}

export const POLLAR_DESTINO = process.env.NEXT_PUBLIC_POLLAR_DESTINO || "";
