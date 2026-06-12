export type RiskLevel = "low" | "medium" | "high" | "unknown";

export function getRiskLabel(score: number | null | undefined): RiskLevel {
  if (score === null || score === undefined) {
    return "unknown";
  }
  if (score < 0.3) {
    return "low";
  }
  if (score < 0.6) {
    return "medium";
  }
  return "high";
}

export function getRiskColor(score: number | null | undefined): string {
  const level = getRiskLabel(score);
  switch (level) {
    case "low":
      return "#22c55e";
    case "medium":
      return "#f59e0b";
    case "high":
      return "#ef4444";
    default:
      return "#1e1e2e";
  }
}

export function getRiskDisplayLabel(score: number | null | undefined): string {
  const level = getRiskLabel(score);
  switch (level) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return "—";
  }
}
