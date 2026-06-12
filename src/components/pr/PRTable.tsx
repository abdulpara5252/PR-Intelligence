import Link from "next/link";
import { Check } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StateBadge } from "@/components/ui/StateBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatHours, truncate } from "@/lib/utils/formatters";
import { getRiskColor } from "@/lib/utils/risk";
import type { PullRequest } from "@/types/api.types";

interface PRTableProps {
  prs: PullRequest[];
  showRepo?: boolean;
  linkPrefix?: string;
}

export function PRTable({
  prs,
  showRepo = true,
  linkPrefix = "/prs",
}: PRTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Author</TableHead>
          {showRepo && <TableHead>Repo</TableHead>}
          <TableHead>State</TableHead>
          <TableHead>Risk</TableHead>
          <TableHead>Cycle Time</TableHead>
          <TableHead>Reviews</TableHead>
          <TableHead>Opened</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prs.map((pr) => {
          const riskScore = pr.metrics?.riskScore ?? null;
          return (
            <TableRow
              key={pr.id}
              className="border-l-[3px]"
              style={{ borderLeftColor: getRiskColor(riskScore) }}
            >
              <TableCell className="font-mono text-sm text-muted-foreground">
                {pr.externalId}
              </TableCell>
              <TableCell className="max-w-[320px]">
                <Link
                  href={`${linkPrefix}/${pr.id}`}
                  className="font-medium hover:text-primary"
                  title={pr.title}
                >
                  {truncate(pr.title, 60)}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-7">
                    <AvatarImage
                      src={`https://github.com/${pr.authorLogin}.png`}
                      alt={pr.authorLogin}
                    />
                    <AvatarFallback className="text-xs">
                      {pr.authorLogin.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{pr.authorLogin}</span>
                </div>
              </TableCell>
              {showRepo && (
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {pr.repoFullName}
                </TableCell>
              )}
              <TableCell>
                <StateBadge state={pr.state} />
              </TableCell>
              <TableCell>
                <RiskBadge score={riskScore} />
              </TableCell>
              <TableCell className="font-mono">
                {formatHours(pr.metrics?.cycleTimeHours)}
              </TableCell>
              <TableCell className="font-mono">
                <span className="inline-flex items-center gap-1">
                  {pr.metrics?.reviewCount ?? 0}
                  {(pr.metrics?.approvalCount ?? 0) > 0 && (
                    <Check className="size-4 text-risk-low" />
                  )}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(pr.createdAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
