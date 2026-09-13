export function BrandMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="3" y="13" width="26" height="6" rx="1.5" fill="#2C2823" />
      <rect x="3" y="14.5" width="26" height="1" fill="#E0783A" />
      <rect x="3" y="16.5" width="26" height="1" fill="#C6E08A" />
      <circle cx="9" cy="16" r="3.2" fill="#0C0B09" stroke="#E0783A" strokeWidth="1.6" />
      <circle cx="23" cy="16" r="3.2" fill="#0C0B09" stroke="#C6E08A" strokeWidth="1.6" />
    </svg>
  );
}
