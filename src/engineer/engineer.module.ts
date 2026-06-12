import { Module } from '@nestjs/common';
import { EngineerResolver } from './engineer.resolver';
import { EngineerService } from './engineer.service';

@Module({
  providers: [EngineerService, EngineerResolver],
  exports: [EngineerService],
})
export class EngineerModule {}
