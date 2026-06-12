export interface PRMetrics {
  cycleTimeHours: number | null;
  reviewTimeHours?: number | null;
  reviewCount: number;
  approvalCount: number;
  commentCount?: number;
  riskScore: number | null;
  hasTestChanges?: boolean;
}

export interface PRReview {
  reviewerLogin: string;
  state: string;
  body?: string | null;
  submittedAt: string;
}

export interface AIInsight {
  summary: string;
  riskFlags: string[];
  generatedAt: string;
}

export interface PullRequest {
  id: string;
  externalId: number;
  repoFullName: string;
  title: string;
  body?: string | null;
  authorLogin: string;
  state: string;
  isDraft: boolean;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits?: number;
  htmlUrl?: string;
  createdAt: string;
  mergedAt: string | null;
  metrics: PRMetrics | null;
  reviews?: PRReview[];
  aiInsight?: AIInsight | null;
}

export interface Engineer {
  login: string;
  name: string | null;
  avatarUrl: string | null;
  totalPRs: number;
  mergedPRs?: number;
  totalReviews: number;
  avgCycleTimeHours: number | null;
  avgRiskScore: number | null;
  reviewParticipation: number | null;
}

export interface GetPRsResponse {
  prs: PullRequest[];
}

export interface GetPRDetailResponse {
  prWithInsight: PullRequest | null;
}

export interface GetEngineersResponse {
  engineers: Engineer[];
}

export interface GetEngineerProfileResponse {
  engineer: Engineer | null;
  prs: PullRequest[];
}

export interface GetLeaderboardResponse {
  leaderboard: Engineer[];
}

export type PRState = "open" | "merged" | "closed";

export type ReviewState =
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "COMMENTED"
  | "DISMISSED";
