import { KeyRound, ShieldAlert, Wallet } from "lucide-react";

export function ModuleWait({ label = "Cargando módulo" }: { label?: string }) {
  return (
    <div className="rise flex items-center gap-3 rounded-[22px] border border-line bg-card px-4 py-4 text-sm text-dim">
      <span className="live-dot h-2 w-2 rounded-full bg-accent" />
      {label}
    </div>
  );
}

export function PaySkeleton() {
  return (
    <div className="glow animate-pulse rounded-[22px] border border-line bg-card p-8">
      <div className="h-3 w-24 rounded bg-soft" />
      <div className="mt-6 h-12 w-20 rounded bg-soft" />
      <div className="mt-4 h-16 rounded-2xl bg-soft" />
      <div className="mt-6 h-11 rounded-full bg-soft" />
    </div>
  );
}

export function EmptyHint({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Wallet;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 rounded-[22px] border border-line bg-card p-4">
      <Icon size={18} className="mt-0.5 shrink-0 text-accent" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm leading-6 text-dim">{body}</p>
      </div>
    </div>
  );
}

export { KeyRound, ShieldAlert, Wallet };
