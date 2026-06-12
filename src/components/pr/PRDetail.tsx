"use client";

import { useQuery } from "@apollo/client/react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

import { AIInsightCard } from "@/components/pr/AIInsightCard";
import { PRMetricsRow } from "@/components/pr/PRMetricsRow";
import { PRReviewsList } from "@/components/pr/PRReviewsList";
import { Button } from "@/components/ui/button";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Skeleton } from "@/components/ui/skeleton";
import { StateBadge } from "@/components/ui/StateBadge";
import { GET_PR_DETAIL } from "@/lib/graphql/queries";
import { formatTimeAgo } from "@/lib/utils/formatters";
import type { GetPRDetailResponse } from "@/types/api.types";

interface PRDetailProps {
  id: string;
}

export function PRDetail({ id }: PRDetailProps) {
  const { data, loading, error, refetch } = useQuery<GetPRDetailResponse>(
    GET_PR_DETAIL,
    { variables: { id } }
  );

  const pr = data?.prWithInsight;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard message={error.message} onRetry={() => refetch()} />
    );
  }

  if (!pr) {
    return <ErrorCard message="Pull request not found." />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href="/prs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to PRs
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {pr.title}
              </h1>
              <StateBadge state={pr.state} />
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {pr.repoFullName} #{pr.externalId}
              <span className="mx-1.5 text-border">·</span>
              @{pr.authorLogin}
              <span className="mx-1.5 text-border">·</span>
              {formatTimeAgo(pr.createdAt)}
            </p>
          </div>
          {pr.htmlUrl && (
            <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
              <a href={pr.htmlUrl} target="_blank" rel="noopener noreferrer">
                Open on GitHub
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <PRMetricsRow
        metrics={pr.metrics}
        additions={pr.additions}
        deletions={pr.deletions}
      />

      <AIInsightCard insight={pr.aiInsight} />

      <section>
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          Reviews
          <span className="ml-1.5 font-normal text-muted-foreground">
            ({pr.reviews?.length ?? 0})
          </span>
        </h2>
        <PRReviewsList reviews={pr.reviews ?? []} />
      </section>
    </div>
  );
}
