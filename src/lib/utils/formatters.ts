export function formatHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined) {
    return "—";
  }
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) {
    return "—";
  }
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateStr);
}

export function formatRiskLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return "—";
  }
  return score.toFixed(2);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${value.toFixed(0)}%`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}
