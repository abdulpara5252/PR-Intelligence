import { cn } from "@/lib/utils";

interface StateBadgeProps {
  state: string;
  className?: string;
}

const stateStyles: Record<string, string> = {
  open: "bg-stone-100 text-stone-600 border border-stone-200",
  merged: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  closed: "bg-red-50 text-red-700 border border-red-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CHANGES_REQUESTED: "bg-amber-50 text-amber-800 border border-amber-200",
  COMMENTED: "bg-stone-100 text-stone-600 border border-stone-200",
  DISMISSED: "bg-red-50 text-red-700 border border-red-200",
};

export function StateBadge({ state, className }: StateBadgeProps) {
  const normalized = state.toLowerCase();
  const style =
    stateStyles[state] ??
    stateStyles[normalized] ??
    "bg-stone-100 text-stone-600 border border-stone-200";

  const display =
    state === "CHANGES_REQUESTED"
      ? "changes requested"
      : normalized;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
        className
      )}
    >
      {display}
    </span>
  );
}
