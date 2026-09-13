export const PHASE = ["pending", "stale", "vivo", "cerrado"] as const;

export function phaseLabel(n?: number | bigint) {
  const i = Number(n ?? 0);
  return PHASE[i] ?? "pending";
}

export function phaseCopy(n?: number | bigint) {
  const key = phaseLabel(n);
  if (key === "pending") return "Faltan joins. Podés salir y recuperar el colateral.";
  if (key === "stale") return "Pasaron 7 días sin llenarse. No entran más. Quien ya entró puede leave().";
  if (key === "vivo") return "Todos entraron. Aportar, cobrar o marcar falla. recover() si se congela.";
  return "Cerrado. Colateral y bono ya se acreditaron.";
}
