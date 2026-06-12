import { getRiskDisplayLabel, getRiskLabel } from "@/lib/utils/risk";
import { formatRiskLabel } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  score: number | null | undefined;
  className?: string;
}

const riskStyles = {
  low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  medium: "bg-amber-50 text-amber-800 border border-amber-200",
  high: "bg-red-50 text-red-700 border border-red-200",
  unknown: "bg-stone-100 text-stone-500 border border-stone-200",
} as const;

export function RiskBadge({ score, className }: RiskBadgeProps) {
  const level = getRiskLabel(score);
  const label = getRiskDisplayLabel(score);

  if (level === "unknown") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2.5 py-1 font-mono text-sm",
          riskStyles.unknown,
          className
        )}
      >
        —
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 font-mono text-sm",
        riskStyles[level],
        className
      )}
    >
      {label} • {formatRiskLabel(score)}
    </span>
  );
}
