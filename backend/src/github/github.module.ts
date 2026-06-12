import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { GitHubApiService } from './github-api.service';
import { WebhookSignatureGuard } from './guards/webhook-signature.guard';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [QueueModule],
  controllers: [WebhookController],
  providers: [GitHubApiService, WebhookSignatureGuard],
  exports: [GitHubApiService],
})
export class GitHubModule {}
