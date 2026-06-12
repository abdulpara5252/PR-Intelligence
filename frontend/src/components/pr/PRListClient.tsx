"use client";

import { useQuery } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { PRTable } from "@/components/pr/PRTable";
import { Button } from "@/components/ui/button";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { getApolloClient } from "@/lib/apollo-client";
import { GET_PRS } from "@/lib/graphql/queries";
import type { GetPRsResponse } from "@/types/api.types";

const PAGE_SIZE = 20;

export function PRListClient() {
  const [page, setPage] = useState(1);
  const [repo, setRepo] = useState("");
  const [author, setAuthor] = useState("");
  const [state, setState] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["prs", { repo, author, state, page }],
    queryFn: async () => {
      const client = getApolloClient();
      const result = await client.query<GetPRsResponse>({
        query: GET_PRS,
        variables: {
          repo: repo || undefined,
          author: author || undefined,
          state: state || undefined,
          page,
          limit: PAGE_SIZE,
        },
      });
      return result.data?.prs ?? [];
    },
  });

  const prs = data ?? [];
  const hasMore = prs.length === PAGE_SIZE;

  return (
    <div>
      <PageHeader
        title="Pull Requests"
        description="Monitor PR quality metrics across your repositories"
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Repo name or owner/repo"
          value={repo}
          onChange={(e) => {
            setRepo(e.target.value);
            setPage(1);
          }}
          className="w-56"
        />
        <Input
          placeholder="Author login"
          value={author}
          onChange={(e) => {
            setAuthor(e.target.value);
            setPage(1);
          }}
          className="w-48"
        />
        <Select
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setPage(1);
          }}
          className="w-36"
        >
          <option value="">All states</option>
          <option value="open">Open</option>
          <option value="merged">Merged</option>
          <option value="closed">Closed</option>
        </Select>
      </div>

      {isLoading && <SkeletonTable columns={9} />}

      {isError && (
        <ErrorCard
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && prs.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
          <Inbox className="size-10 opacity-50" />
          <p className="text-sm">No pull requests found</p>
        </div>
      )}

      {!isLoading && !isError && prs.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-xs)]">
          <PRTable prs={prs} />
        </div>
      )}

      {!isLoading && !isError && (prs.length > 0 || page > 1) && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-base text-muted-foreground">Page {page}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
