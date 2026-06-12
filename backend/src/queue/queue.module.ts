import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Configuration } from '../config/configuration';
import { PR_QUEUE } from './queue.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration, true>) => ({
        connection: {
          url: configService.get('redis.url', { infer: true }),
        },
      }),
    }),
    BullModule.registerQueue({
      name: PR_QUEUE,
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
