"use client";

import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GET_ENGINEERS } from "@/lib/graphql/queries";
import { formatHours, formatPercent } from "@/lib/utils/formatters";
import type { Engineer, GetEngineersResponse } from "@/types/api.types";

type SortKey = "login" | "totalPRs" | "avgCycleTimeHours" | "reviewParticipation";

export function EngineerTable() {
  const { data, loading, error, refetch } = useQuery<GetEngineersResponse>(
    GET_ENGINEERS,
    { variables: { page: 1, limit: 50 } }
  );
  const [sortKey, setSortKey] = useState<SortKey>("totalPRs");
  const [sortAsc, setSortAsc] = useState(false);

  const engineers = useMemo(() => {
    const list = [...(data?.engineers ?? [])];
    list.sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      const numA = Number(aVal);
      const numB = Number(bVal);
      return sortAsc ? numA - numB : numB - numA;
    });
    return list;
  }, [data?.engineers, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortAsc ? " ↑" : " ↓";
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Engineers" description="Team performance overview" />
        <SkeletonTable columns={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Engineers" />
        <ErrorCard message={error.message} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Engineers"
        description="Team performance overview"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button type="button" onClick={() => handleSort("login")}>
                Engineer{sortIndicator("login")}
              </button>
            </TableHead>
            <TableHead>
              <button type="button" onClick={() => handleSort("totalPRs")}>
                Total PRs{sortIndicator("totalPRs")}
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => handleSort("avgCycleTimeHours")}
              >
                Avg Cycle Time{sortIndicator("avgCycleTimeHours")}
              </button>
            </TableHead>
            <TableHead>Avg Risk</TableHead>
            <TableHead>Reviews</TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => handleSort("reviewParticipation")}
              >
                Participation{sortIndicator("reviewParticipation")}
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {engineers.map((engineer: Engineer) => (
            <TableRow key={engineer.login}>
              <TableCell>
                <Link
                  href={`/engineers/${engineer.login}`}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <Avatar className="size-6">
                    {engineer.avatarUrl && (
                      <AvatarImage src={engineer.avatarUrl} alt={engineer.login} />
                    )}
                    <AvatarFallback className="text-[10px]">
                      {engineer.login.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {engineer.name ?? engineer.login}
                  </span>
                  {engineer.name && (
                    <span className="text-xs text-muted-foreground">
                      @{engineer.login}
                    </span>
                  )}
                </Link>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {engineer.totalPRs}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {formatHours(engineer.avgCycleTimeHours)}
              </TableCell>
              <TableCell>
                <RiskBadge score={engineer.avgRiskScore} />
              </TableCell>
              <TableCell className="font-mono text-sm">
                {engineer.totalReviews}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {formatPercent(engineer.reviewParticipation)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
