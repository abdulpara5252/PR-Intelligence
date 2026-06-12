import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { EngineerType } from './dto/engineer.type';
import { EngineerService } from './engineer.service';

@Resolver(() => EngineerType)
export class EngineerResolver {
  constructor(private readonly engineerService: EngineerService) {}

  @Query(() => [EngineerType], { name: 'engineers' })
  async getEngineers(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<EngineerType[]> {
    return this.engineerService.findAll(page, limit) as Promise<EngineerType[]>;
  }

  @Query(() => EngineerType, { name: 'engineer', nullable: true })
  async getEngineer(
    @Args('login', { type: () => String }) login: string,
  ): Promise<EngineerType> {
    return this.engineerService.findOne(login) as Promise<EngineerType>;
  }

  @Query(() => [EngineerType], { name: 'leaderboard' })
  async getLeaderboard(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<EngineerType[]> {
    return this.engineerService.getLeaderboard(limit) as Promise<EngineerType[]>;
  }
}
