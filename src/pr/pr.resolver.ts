import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { PrFilterInput } from './dto/pr-filter.input';
import { PullRequestType } from './dto/pr.type';
import { PrService } from './pr.service';

@Resolver(() => PullRequestType)
export class PrResolver {
  constructor(private readonly prService: PrService) {}

  @Query(() => [PullRequestType], { name: 'prs' })
  async getPullRequests(
    @Args('repo', { type: () => String, nullable: true }) repo?: string,
    @Args('author', { type: () => String, nullable: true }) author?: string,
    @Args('state', { type: () => String, nullable: true }) state?: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<PullRequestType[]> {
    const filters: PrFilterInput = { repo, author, state, page, limit };
    return this.prService.findAll(filters) as Promise<PullRequestType[]>;
  }

  @Query(() => PullRequestType, { name: 'pr', nullable: true })
  async getPullRequest(
    @Args('id', { type: () => String }) id: string,
  ): Promise<PullRequestType> {
    return this.prService.findOne(id) as Promise<PullRequestType>;
  }

  @Query(() => PullRequestType, { name: 'prWithInsight', nullable: true })
  async getPullRequestWithInsight(
    @Args('id', { type: () => String }) id: string,
  ): Promise<PullRequestType> {
    return this.prService.getWithInsight(id) as Promise<PullRequestType>;
  }
}
