import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import type { ProcessPrJobPayload } from '../github/webhook.controller';
import { GitHubApiService } from '../github/github-api.service';
import { PrismaService } from '../prisma/prisma.service';
import { PROCESS_PR_JOB, PR_QUEUE } from '../queue/queue.constants';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly githubApiService: GitHubApiService,
    private readonly prisma: PrismaService,
    @InjectQueue(PR_QUEUE)
    private readonly prQueue: Queue<ProcessPrJobPayload>,
  ) {}

  async manualSync(repoFullName: string): Promise<{ queued: number }> {
    const [owner, repo] = repoFullName.split('/');

    if (!owner || !repo) {
      throw new Error(`Invalid repository full name: ${repoFullName}`);
    }

    const syncLog = await this.prisma.syncLog.create({
      data: {
        repoFullName,
        syncType: 'manual',
        status: 'partial',
      },
    });

    try {
      const openPrs = await this.githubApiService.listRepoPRs(owner, repo, 'open');

      await Promise.all(
        openPrs.map((pr) =>
          this.prQueue.add(
            PROCESS_PR_JOB,
            {
              action: 'sync',
              prNumber: pr.number,
              repoFullName,
              repoOwner: owner,
            },
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 5000,
              },
            },
          ),
        ),
      );

      await this.prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'success',
          prsSynced: openPrs.length,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Queued ${openPrs.length} open PRs for ${repoFullName}`);

      return { queued: openPrs.length };
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
