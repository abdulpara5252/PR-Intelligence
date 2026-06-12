import { MessageSquare } from "lucide-react";

import { PRReviewCard } from "@/components/pr/PRReviewCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PRReview } from "@/types/api.types";

interface PRReviewsListProps {
  reviews: PRReview[];
}

export function PRReviewsList({ reviews }: PRReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="Reviews appear when teammates submit feedback on GitHub."
      />
    );
  }

  const sorted = [...reviews].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  return (
    <div className="space-y-3">
      {sorted.map((review, index) => (
        <PRReviewCard
          key={`${review.reviewerLogin}-${review.submittedAt}-${index}`}
          review={review}
        />
      ))}
    </div>
  );
}
