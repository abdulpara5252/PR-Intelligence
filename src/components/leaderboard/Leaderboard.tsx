"use client";

import { useQuery } from "@apollo/client/react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GET_LEADERBOARD } from "@/lib/graphql/queries";
import { formatHours, formatPercent } from "@/lib/utils/formatters";
import type { Engineer, GetLeaderboardResponse } from "@/types/api.types";

const rankStyles: Record<number, { border: string; text: string }> = {
  1: { border: "#fbbf24", text: "text-[#fbbf24]" },
  2: { border: "#94a3b8", text: "text-[#94a3b8]" },
  3: { border: "#b45309", text: "text-[#b45309]" },
};

export function Leaderboard() {
  const { data, loading, error, refetch } = useQuery<GetLeaderboardResponse>(
    GET_LEADERBOARD,
    { variables: { limit: 10 } }
  );

  const entries = data?.leaderboard ?? [];

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Leaderboard"
          description="Top engineers by PR volume and review participation"
        />
        <SkeletonTable columns={6} rows={10} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Leaderboard" />
        <ErrorCard message={error.message} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        description="Top engineers by PR volume and review participation"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Engineer</TableHead>
            <TableHead>PRs Merged</TableHead>
            <TableHead>Avg Cycle Time</TableHead>
            <TableHead>Reviews Given</TableHead>
            <TableHead>Participation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry: Engineer, index) => {
            const rank = index + 1;
            const style = rankStyles[rank];
            return (
              <TableRow
                key={entry.login}
                className="border-l-[3px]"
                style={{
                  borderLeftColor: style?.border ?? "#1e1e2e",
                }}
              >
                <TableCell
                  className={`font-mono text-sm font-semibold ${style?.text ?? ""}`}
                >
                  {rank}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      {entry.avatarUrl && (
                        <AvatarImage src={entry.avatarUrl} alt={entry.login} />
                      )}
                      <AvatarFallback className="text-xs">
                        {entry.login.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {entry.name ?? entry.login}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{entry.login}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {entry.mergedPRs ?? 0}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatHours(entry.avgCycleTimeHours)}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {entry.totalReviews}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatPercent(entry.reviewParticipation)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
