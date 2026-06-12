import { Module } from '@nestjs/common';
import { AIModule } from '../ai/ai.module';
import { GitHubModule } from '../github/github.module';
import { MetricsModule } from '../metrics/metrics.module';
import { QueueModule } from '../queue/queue.module';
import { PrProcessor } from './pr.processor';
import { PrResolver } from './pr.resolver';
import { PrService } from './pr.service';

@Module({
  imports: [QueueModule, GitHubModule, MetricsModule, AIModule],
  providers: [PrService, PrResolver, PrProcessor],
  exports: [PrService],
})
export class PrModule {}
