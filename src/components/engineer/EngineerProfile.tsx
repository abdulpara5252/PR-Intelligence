"use client";

import { useQuery } from "@apollo/client/react";

import { WeeklyPRChart } from "@/components/engineer/WeeklyPRChart";
import { PRTable } from "@/components/pr/PRTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { Skeleton } from "@/components/ui/skeleton";
import { GET_ENGINEER_PROFILE } from "@/lib/graphql/queries";
import { formatHours, formatPercent } from "@/lib/utils/formatters";
import type { GetEngineerProfileResponse } from "@/types/api.types";
import { GitPullRequest, MessageSquare, Shield, Timer } from "lucide-react";

interface EngineerProfileProps {
  login: string;
}

export function EngineerProfile({ login }: EngineerProfileProps) {
  const { data, loading, error, refetch } = useQuery<GetEngineerProfileResponse>(
    GET_ENGINEER_PROFILE,
    { variables: { login } }
  );

  const engineer = data?.engineer;
  const prs = data?.prs ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard message={error.message} onRetry={() => refetch()} />
    );
  }

  if (!engineer) {
    return <ErrorCard message="Engineer not found." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          {engineer.avatarUrl && (
            <AvatarImage src={engineer.avatarUrl} alt={engineer.login} />
          )}
          <AvatarFallback className="text-lg">
            {engineer.login.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs text-muted-foreground">Engineers /</p>
          <h1 className="text-xl font-semibold">
            {engineer.name ?? engineer.login}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            @{engineer.login}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={GitPullRequest}
          label="Total PRs"
          value={String(engineer.totalPRs)}
          unit={`${engineer.mergedPRs ?? 0} merged`}
        />
        <MetricCard
          icon={Timer}
          label="Avg Cycle Time"
          value={formatHours(engineer.avgCycleTimeHours)}
        />
        <MetricCard
          icon={Shield}
          label="Avg Risk Score"
          value={
            engineer.avgRiskScore != null
              ? engineer.avgRiskScore.toFixed(2)
              : "—"
          }
        />
        <MetricCard
          icon={MessageSquare}
          label="Reviews Given"
          value={String(engineer.totalReviews)}
          unit={formatPercent(engineer.reviewParticipation)}
        />
      </div>

      <WeeklyPRChart prs={prs} />

      <div>
        <h2 className="mb-3 text-sm font-medium">Recent Pull Requests</h2>
        {prs.length > 0 ? (
          <PRTable prs={prs} showRepo={true} />
        ) : (
          <p className="text-sm text-muted-foreground">No pull requests found.</p>
        )}
      </div>
    </div>
  );
}
