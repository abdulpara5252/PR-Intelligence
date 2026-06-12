"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PullRequest } from "@/types/api.types";

interface WeeklyPRChartProps {
  prs: PullRequest[];
}

interface WeekBucket {
  label: string;
  count: number;
}

function getWeekLabel(date: Date): string {
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const weekOfMonth = Math.ceil(date.getDate() / 7);
  return `${month} W${weekOfMonth}`;
}

function buildWeeklyData(prs: PullRequest[]): WeekBucket[] {
  const now = new Date();
  const buckets: WeekBucket[] = [];

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const count = prs.filter((pr) => {
      const created = new Date(pr.createdAt);
      return created >= weekStart && created < weekEnd;
    }).length;

    buckets.push({
      label: getWeekLabel(weekStart),
      count,
    });
  }

  return buckets;
}

export function WeeklyPRChart({ prs }: WeeklyPRChartProps) {
  const data = buildWeeklyData(prs);

  return (
    <div className="rounded-sm border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-medium">PRs per Week (last 8 weeks)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis
            dataKey="label"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            axisLine={{ stroke: "#1e1e2e" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            axisLine={{ stroke: "#1e1e2e" }}
            tickLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              background: "#111118",
              border: "1px solid #1e1e2e",
              borderRadius: "4px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#a1a1aa" }}
          />
          <Bar dataKey="count" fill="#6366f1" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
