"use client";

/**
 * Reusable MTN MoMo brand badge.
 * size="sm"  — inline icon (trust strips, mini badges)
 * size="md"  — compact chip (mobile hero overlay)
 * size="lg"  — full floating card (desktop hero)
 */

interface MtnBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function MtnBadge({ size = "md", className = "" }: MtnBadgeProps) {
  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 ${className}`}
        aria-label="MTN MoMo"
      >
        <MtnMark small />
        <span className="font-bold text-gray-700 dark:text-gray-300 text-xs">
          MTN MoMo
        </span>
      </span>
    );
  }

  if (size === "md") {
    return (
      <div
        className={`inline-flex items-center gap-2 bg-white dark:bg-gray-900/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-gray-100 dark:border-gray-800 ${className}`}
        aria-label="MTN MoMo accepted"
      >
        <MtnMark />
        <div className="leading-tight">
          <p className="text-xs font-black text-gray-900 dark:text-white">MTN MoMo</p>
          <p className="text-[10px] text-gray-400">Payments accepted</p>
        </div>
      </div>
    );
  }

  /* size === "lg" — hero floating card */
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-3.5 ${className}`}
      aria-label="MTN MoMo accepted"
    >
      <div className="flex items-center gap-3">
        <MtnMark large />
        <div className="leading-tight">
          <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
            MTN MoMo
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Payments accepted</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold text-green-600">Active in Rwanda</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MTN yellow brand mark ─────────────────────────────────────────── */

function MtnMark({ small, large }: { small?: boolean; large?: boolean }) {
  const size = large
    ? "w-12 h-12 rounded-xl"
    : small
    ? "w-5 h-5 rounded"
    : "w-9 h-9 rounded-xl";

  const text = large
    ? "text-sm"
    : small
    ? "text-[8px]"
    : "text-[11px]";

  return (
    <div
      className={`${size} bg-[#FFCB00] flex flex-col items-center justify-center shrink-0 shadow-sm relative overflow-hidden`}
    >
      {/* subtle diagonal shine */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
      <span className={`${text} font-black text-black tracking-tight leading-none relative z-10`}>
        MTN
      </span>
      {!small && (
        <span className="text-[6px] font-bold text-black/60 leading-none tracking-widest relative z-10 mt-0.5">
          MOMO
        </span>
      )}
    </div>
  );
}
