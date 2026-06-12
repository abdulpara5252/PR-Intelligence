import { Clock, FileDiff, MessageSquare, Shield } from "lucide-react";

import { MetricCard } from "@/components/ui/MetricCard";
import { formatHours, formatRiskLabel } from "@/lib/utils/formatters";
import { getRiskDisplayLabel } from "@/lib/utils/risk";
import type { PRMetrics } from "@/types/api.types";

interface PRMetricsRowProps {
  metrics: PRMetrics | null;
  additions: number;
  deletions: number;
}

export function PRMetricsRow({
  metrics,
  additions,
  deletions,
}: PRMetricsRowProps) {
  const linesChanged = additions + deletions;
  const riskLabel = getRiskDisplayLabel(metrics?.riskScore);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={Clock}
        label="Cycle Time"
        value={formatHours(metrics?.cycleTimeHours)}
      />
      <MetricCard
        icon={MessageSquare}
        label="Review Time"
        value={formatHours(metrics?.reviewTimeHours)}
      />
      <MetricCard
        icon={FileDiff}
        label="Lines Changed"
        value={linesChanged.toLocaleString()}
        unit={`+${additions} / -${deletions}`}
      />
      <MetricCard
        icon={Shield}
        label="Risk Score"
        value={
          metrics?.riskScore != null
            ? `${riskLabel} • ${formatRiskLabel(metrics.riskScore)}`
            : "—"
        }
      />
    </div>
  );
}
