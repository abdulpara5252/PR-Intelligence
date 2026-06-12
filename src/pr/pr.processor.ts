import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AIService } from '../ai/ai.service';
import type { ProcessPrJobPayload } from '../github/webhook.controller';
import { GitHubApiService } from '../github/github-api.service';
import { MetricsService } from '../metrics/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { PROCESS_PR_JOB, PR_QUEUE } from '../queue/queue.constants';

@Processor(PR_QUEUE)
export class PrProcessor extends WorkerHost {
  private readonly logger = new Logger(PrProcessor.name);

  constructor(
    private readonly githubApiService: GitHubApiService,
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
    private readonly aiService: AIService,
  ) {
    super();
  }

  async process(job: Job<ProcessPrJobPayload>): Promise<void> {
    if (job.name !== PROCESS_PR_JOB) {
      return;
    }

    const { prNumber, repoFullName, repoOwner } = job.data;
    const [owner, repo] = repoFullName.split('/');

    if (!owner || !repo) {
      throw new Error(`Invalid repository full name: ${repoFullName}`);
    }

    const syncLog = await this.prisma.syncLog.create({
      data: {
        repoFullName,
        syncType: 'webhook',
        status: 'partial',
      },
    });

    try {
      const [githubPr, diff, githubReviews] = await Promise.all([
        this.githubApiService.getPR(owner, repo, prNumber),
        this.githubApiService.getPRDiff(owner, repo, prNumber),
        this.githubApiService.getPRReviews(owner, repo, prNumber),
      ]);

      const state =
        githubPr.merged_at !== null
          ? 'merged'
          : githubPr.state === 'closed'
            ? 'closed'
            : 'open';

      const pullRequest = await this.prisma.pullRequest.upsert({
        where: {
          externalId_repoFullName: {
            externalId: githubPr.number,
            repoFullName,
          },
        },
        create: {
          externalId: githubPr.number,
          repoFullName,
          title: githubPr.title,
          body: githubPr.body,
          authorLogin: githubPr.user.login,
          state,
          isDraft: githubPr.draft,
          baseBranch: githubPr.base.ref,
          headBranch: githubPr.head.ref,
          additions: githubPr.additions,
          deletions: githubPr.deletions,
          changedFiles: githubPr.changed_files,
          commits: githubPr.commits,
          htmlUrl: githubPr.html_url,
          createdAt: new Date(githubPr.created_at),
          updatedAt: new Date(githubPr.updated_at),
          mergedAt: githubPr.merged_at ? new Date(githubPr.merged_at) : null,
          closedAt: githubPr.closed_at ? new Date(githubPr.closed_at) : null,
        },
        update: {
          title: githubPr.title,
          body: githubPr.body,
          authorLogin: githubPr.user.login,
          state,
          isDraft: githubPr.draft,
          baseBranch: githubPr.base.ref,
          headBranch: githubPr.head.ref,
          additions: githubPr.additions,
          deletions: githubPr.deletions,
          changedFiles: githubPr.changed_files,
          commits: githubPr.commits,
          htmlUrl: githubPr.html_url,
          updatedAt: new Date(githubPr.updated_at),
          mergedAt: githubPr.merged_at ? new Date(githubPr.merged_at) : null,
          closedAt: githubPr.closed_at ? new Date(githubPr.closed_at) : null,
          syncedAt: new Date(),
        },
      });

      const reviews = await Promise.all(
        githubReviews
          .filter((review) => review.user !== null && review.submitted_at !== null)
          .map((review) =>
            this.prisma.pRReview.upsert({
              where: {
                externalId_prId: {
                  externalId: BigInt(review.id),
                  prId: pullRequest.id,
                },
              },
              create: {
                prId: pullRequest.id,
                externalId: BigInt(review.id),
                reviewerLogin: review.user!.login,
                state: review.state,
                body: review.body,
                submittedAt: new Date(review.submitted_at!),
              },
              update: {
                reviewerLogin: review.user!.login,
                state: review.state,
                body: review.body,
                submittedAt: new Date(review.submitted_at!),
              },
            }),
          ),
      );

      const computedMetrics = this.metricsService.computeForPR(
        pullRequest,
        reviews,
        diff,
      );

      await this.prisma.pRMetrics.upsert({
        where: { prId: pullRequest.id },
        create: {
          prId: pullRequest.id,
          ...computedMetrics,
        },
        update: {
          ...computedMetrics,
          computedAt: new Date(),
        },
      });

      if (state === 'merged' || reviews.length >= 2) {
        await this.aiService.generatePRInsight(
          pullRequest,
          diff,
          computedMetrics.reviewCount,
          computedMetrics.approvalCount,
        );
      }

      await this.metricsService.computeEngineerStats(pullRequest.authorLogin);

      await this.prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'success',
          prsSynced: 1,
          completedAt: new Date(),
        },
      });

      this.logger.log(
        `Processed PR #${prNumber} for ${repoFullName} (owner context: ${repoOwner})`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      await this.prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'failed',
          error: message,
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }
}
