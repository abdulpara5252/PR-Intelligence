import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PullRequest } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PrFilterInput } from './dto/pr-filter.input';

@Injectable()
export class PrService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: PrFilterInput = {}): Promise<PullRequest[]> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PullRequestWhereInput = {};

    if (filters.repo?.trim()) {
      where.repoFullName = {
        contains: filters.repo.trim(),
        mode: 'insensitive',
      };
    }

    if (filters.author?.trim()) {
      where.authorLogin = {
        contains: filters.author.trim(),
        mode: 'insensitive',
      };
    }

    if (filters.state?.trim()) {
      where.state = filters.state.trim();
    }

    return this.prisma.pullRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        metrics: true,
        reviews: true,
        aiInsight: true,
      },
    });
  }

  async findOne(id: string): Promise<PullRequest> {
    const pr = await this.prisma.pullRequest.findUnique({
      where: { id },
      include: {
        metrics: true,
        reviews: true,
        aiInsight: true,
      },
    });

    if (!pr) {
      throw new NotFoundException(`Pull request ${id} not found`);
    }

    return pr;
  }

  async getWithInsight(id: string): Promise<PullRequest> {
    const pr = await this.prisma.pullRequest.findUnique({
      where: { id },
      include: {
        metrics: true,
        reviews: true,
        aiInsight: true,
      },
    });

    if (!pr) {
      throw new NotFoundException(`Pull request ${id} not found`);
    }

    return pr;
  }
}
