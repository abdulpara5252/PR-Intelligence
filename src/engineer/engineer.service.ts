import { Injectable, NotFoundException } from '@nestjs/common';
import { Engineer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EngineerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20): Promise<Engineer[]> {
    const skip = (page - 1) * limit;

    return this.prisma.engineer.findMany({
      skip,
      take: limit,
      orderBy: { totalPRs: 'desc' },
    });
  }

  async findOne(login: string): Promise<Engineer> {
    const engineer = await this.prisma.engineer.findUnique({
      where: { login },
    });

    if (!engineer) {
      throw new NotFoundException(`Engineer ${login} not found`);
    }

    return engineer;
  }

  async getLeaderboard(limit = 10): Promise<Engineer[]> {
    return this.prisma.engineer.findMany({
      take: limit,
      orderBy: [{ avgRiskScore: 'asc' }, { totalPRs: 'desc' }],
    });
  }
}
