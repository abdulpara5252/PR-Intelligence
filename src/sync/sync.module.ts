import { Module } from '@nestjs/common';
import { GitHubModule } from '../github/github.module';
import { QueueModule } from '../queue/queue.module';
import { SyncService } from './sync.service';

@Module({
  imports: [GitHubModule, QueueModule],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
