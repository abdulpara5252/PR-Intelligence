import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { PROCESS_PR_JOB, PR_QUEUE } from '../queue/queue.constants';
import { WebhookSignatureGuard } from './guards/webhook-signature.guard';

export interface ProcessPrJobPayload {
  action: string;
  prNumber: number;
  repoFullName: string;
  repoOwner: string;
}

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    @InjectQueue(PR_QUEUE)
    private readonly prQueue: Queue<ProcessPrJobPayload>,
  ) {}

  @Post('github')
  @HttpCode(200)
  @UseGuards(WebhookSignatureGuard)
  @UsePipes(new ValidationPipe({ whitelist: false }))
  async handleGitHubWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers('x-github-event') event: string,
  ): Promise<{ received: boolean }> {
    if (event === 'pull_request') {
      return this.handlePullRequestEvent(payload);
    }

    if (event === 'pull_request_review') {
      return this.handlePullRequestReviewEvent(payload);
    }

    return { received: true };
  }

  private async handlePullRequestEvent(
    payload: Record<string, unknown>,
  ): Promise<{ received: boolean }> {
    const action = payload.action;
    const pullRequest = payload.pull_request as
      | { number: number }
      | undefined;
    const repository = payload.repository as
      | { full_name: string; owner: { login: string } }
      | undefined;

    if (
      typeof action !== 'string' ||
      !pullRequest ||
      typeof pullRequest.number !== 'number' ||
      !repository ||
      typeof repository.full_name !== 'string' ||
      !repository.owner ||
      typeof repository.owner.login !== 'string'
    ) {
      throw new BadRequestException('Invalid pull_request webhook payload');
    }

    this.logger.log(`Received pull_request event: ${action}`);

    await this.queuePrJob(
      action,
      pullRequest.number,
      repository.full_name,
      repository.owner.login,
    );

    return { received: true };
  }

  private async handlePullRequestReviewEvent(
    payload: Record<string, unknown>,
  ): Promise<{ received: boolean }> {
    const action = payload.action;
    const pullRequest = payload.pull_request as
      | { number: number }
      | undefined;
    const repository = payload.repository as
      | { full_name: string; owner: { login: string } }
      | undefined;

    if (
      typeof action !== 'string' ||
      !pullRequest ||
      typeof pullRequest.number !== 'number' ||
      !repository ||
      typeof repository.full_name !== 'string' ||
      !repository.owner ||
      typeof repository.owner.login !== 'string'
    ) {
      throw new BadRequestException('Invalid pull_request_review webhook payload');
    }

    this.logger.log(`Received pull_request_review event: ${action}`);

    await this.queuePrJob(
      `review_${action}`,
      pullRequest.number,
      repository.full_name,
      repository.owner.login,
    );

    return { received: true };
  }

  private async queuePrJob(
    action: string,
    prNumber: number,
    repoFullName: string,
    repoOwner: string,
  ): Promise<void> {
    await this.prQueue.add(
      PROCESS_PR_JOB,
      {
        action,
        prNumber,
        repoFullName,
        repoOwner,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    this.logger.log(`Job queued for PR #${prNumber}`);
  }
}
