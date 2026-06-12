import { Injectable } from '@nestjs/common';
import { PRReview, PullRequest } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface ComputedPRMetrics {
  cycleTimeHours: number | null;
  reviewTimeHours: number | null;
  timeToFirstReview: number | null;
  reviewCount: number;
  approvalCount: number;
  commentCount: number;
  riskScore: number | null;
  hasTestChanges: boolean;
}

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  detectTestChanges(diff: string): boolean {
    const filePathPattern = /^diff --git a\/(.+?) b\//gm;
    const matches = diff.matchAll(filePathPattern);

    for (const match of matches) {
      const filePath = match[1] ?? '';
      if (/test|spec|__tests__/i.test(filePath)) {
        return true;
      }
    }

    return false;
  }

  computeRiskScore(
    additions: number,
    deletions: number,
    reviewCount: number,
    hasTestChanges: boolean,
  ): number {
    const sizeScore = (Math.min(additions + deletions, 1000) / 1000) * 0.4;
    const reviewScore = reviewCount < 2 ? 0.3 : 0;
    const testScore = hasTestChanges ? 0 : 0.3;

    return Math.min(1, Math.max(0, sizeScore + reviewScore + testScore));
  }

  computeForPR(
    pr: PullRequest,
    reviews: PRReview[],
    diff: string,
  ): ComputedPRMetrics {
    const sortedReviews = [...reviews].sort(
      (a, b) => a.submittedAt.getTime() - b.submittedAt.getTime(),
    );

    const firstReview = sortedReviews[0];
    const reviewCount = reviews.length;
    const approvalCount = reviews.filter((review) => review.state === 'APPROVED')
      .length;
    const commentCount = reviews.filter((review) => review.state === 'COMMENTED')
      .length;

    const cycleTimeHours =
      pr.mergedAt !== null
        ? (pr.mergedAt.getTime() - pr.createdAt.getTime()) / 3_600_000
        : null;

    const reviewTimeHours = firstReview
      ? (firstReview.submittedAt.getTime() - pr.createdAt.getTime()) / 3_600_000
      : null;

    const timeToFirstReview = reviewTimeHours;
    const hasTestChanges = this.detectTestChanges(diff);
    const riskScore = this.computeRiskScore(
      pr.additions,
      pr.deletions,
      reviewCount,
      hasTestChanges,
    );

    return {
      cycleTimeHours,
      reviewTimeHours,
      timeToFirstReview,
      reviewCount,
      approvalCount,
      commentCount,
      riskScore,
      hasTestChanges,
    };
  }

  async computeEngineerStats(authorLogin: string): Promise<void> {
    const [prs, reviews, teamPrCount] = await Promise.all([
      this.prisma.pullRequest.findMany({
        where: { authorLogin },
        include: { metrics: true },
      }),
      this.prisma.pRReview.findMany({
        where: { reviewerLogin: authorLogin },
      }),
      this.prisma.pullRequest.count(),
    ]);

    const mergedPRs = prs.filter((pr) => pr.state === 'merged').length;
    const cycleTimes = prs
      .map((pr) => pr.metrics?.cycleTimeHours)
      .filter((value): value is number => value !== null && value !== undefined);
    const riskScores = prs
      .map((pr) => pr.metrics?.riskScore)
      .filter((value): value is number => value !== null && value !== undefined);

    const avgCycleTimeHours =
      cycleTimes.length > 0
        ? cycleTimes.reduce((sum, value) => sum + value, 0) / cycleTimes.length
        : null;
    const avgRiskScore =
      riskScores.length > 0
        ? riskScores.reduce((sum, value) => sum + value, 0) / riskScores.length
        : null;
    const reviewParticipation =
      teamPrCount > 0 ? (reviews.length / teamPrCount) * 100 : null;

    await this.prisma.engineer.upsert({
      where: { login: authorLogin },
      create: {
        login: authorLogin,
        totalPRs: prs.length,
        mergedPRs,
        totalReviews: reviews.length,
        avgCycleTimeHours,
        avgRiskScore,
        reviewParticipation,
      },
      update: {
        totalPRs: prs.length,
        mergedPRs,
        totalReviews: reviews.length,
        avgCycleTimeHours,
        avgRiskScore,
        reviewParticipation,
      },
    });
  }
}
