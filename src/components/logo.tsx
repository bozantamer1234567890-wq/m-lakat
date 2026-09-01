/**
 * Three ascending bars: progress / structure / upward movement. The tallest
 * bar is always Emerald (the brand's single accent); the other two inherit
 * the surrounding text color so the mark reads correctly on light or dark.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="4" y="22" width="7" height="14" rx="2" fill="currentColor" />
      <rect x="16.5" y="14" width="7" height="22" rx="2" fill="currentColor" />
      <rect x="29" y="4" width="7" height="32" rx="2" fill="#0F766E" />
    </svg>
  );
}

export function Logo({
  variant = "default",
  className = "",
  markClassName = "h-6 w-6",
}: {
  variant?: "default" | "dark";
  className?: string;
  markClassName?: string;
}) {
  const color = variant === "dark" ? "text-white" : "text-brand-900";
  return (
    <span className={`inline-flex items-center gap-2 ${color} ${className}`}>
      <LogoMark className={markClassName} />
      <span className="text-lg font-semibold tracking-tight">PROVA</span>
    </span>
  );
}
