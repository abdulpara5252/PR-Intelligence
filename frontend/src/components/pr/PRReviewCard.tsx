import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StateBadge } from "@/components/ui/StateBadge";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils/formatters";
import type { PRReview, ReviewState } from "@/types/api.types";

const reviewAccent: Partial<Record<ReviewState, string>> = {
  APPROVED: "border-l-emerald-400",
  CHANGES_REQUESTED: "border-l-amber-400",
  COMMENTED: "border-l-stone-300",
  DISMISSED: "border-l-red-300",
};

function ReviewBody({ body, state }: { body?: string | null; state: string }) {
  const trimmed = body?.trim() ?? "";

  if (trimmed) {
    return (
      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#292524]">
        {trimmed}
      </p>
    );
  }

  const placeholder =
    state === "APPROVED"
      ? "Approved without comment"
      : state === "CHANGES_REQUESTED"
        ? "Requested changes without a summary comment"
        : "No written feedback";

  return (
    <p className="text-sm italic text-[#a8a29e]">{placeholder}</p>
  );
}

interface PRReviewCardProps {
  review: PRReview;
}

export function PRReviewCard({ review }: PRReviewCardProps) {
  const accent =
    reviewAccent[review.state as ReviewState] ?? "border-l-stone-300";

  return (
    <article
      aria-label={`${review.reviewerLogin} review, ${review.state}`}
      className={cn(
        "rounded-lg border border-border border-l-[3px] bg-card p-4 shadow-[var(--shadow-xs)]",
        accent,
        review.state === "DISMISSED" && "bg-muted/30"
      )}
    >
      <StateBadge state={review.state} className="mb-3" />
      <ReviewBody body={review.body} state={review.state} />
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        <Avatar className="size-6 border border-border">
          <AvatarImage
            src={`https://github.com/${review.reviewerLogin}.png`}
            alt={review.reviewerLogin}
          />
          <AvatarFallback className="text-[10px]">
            {review.reviewerLogin.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">
            {review.reviewerLogin}
          </span>
          <span className="mx-1.5 text-border">·</span>
          {formatTimeAgo(review.submittedAt)}
        </p>
      </div>
    </article>
  );
}
