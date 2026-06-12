import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PullRequest } from '@prisma/client';
import OpenAI from 'openai';
import pThrottle from 'p-throttle';
import type { Configuration } from '../config/configuration';
import { PrismaService } from '../prisma/prisma.service';

const SYSTEM_PROMPT =
  'You are a code review assistant. Respond ONLY with valid JSON. No explanation, no markdown.';

const VALID_RISK_FLAGS = new Set([
  'large diff',
  'no test changes',
  'single reviewer',
  'no approvals',
  'touches auth',
  'modifies migrations',
  'draft PR merged',
]);

interface AIInsightResponse {
  summary: string;
  riskFlags: string[];
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly throttledGenerate: (
    pr: PullRequest,
    diff: string,
    reviewCount: number,
    approvalCount: number,
  ) => Promise<AIInsightResponse | null>;

  constructor(
    private readonly configService: ConfigService<Configuration, true>,
    private readonly prisma: PrismaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('openai.apiKey', { infer: true }),
    });
    this.model = this.configService.get('openai.model', { infer: true });

    const throttle = pThrottle({
      limit: 5,
      interval: 60_000,
    });

    this.throttledGenerate = throttle(
      (
        pr: PullRequest,
        diff: string,
        reviewCount: number,
        approvalCount: number,
      ) => this.callOpenAI(pr, diff, reviewCount, approvalCount),
    );
  }

  async generatePRInsight(
    pr: PullRequest,
    diff: string,
    reviewCount: number,
    approvalCount: number,
  ): Promise<void> {
    await this.throttledGenerate(pr, diff, reviewCount, approvalCount);
  }

  private buildUserPrompt(
    pr: PullRequest,
    diff: string,
    reviewCount: number,
    approvalCount: number,
  ): string {
    return [
      'Analyze this GitHub PR:',
      `Title: ${pr.title}`,
      `Author: ${pr.authorLogin}`,
      `Stats: +${pr.additions}/-${pr.deletions}, ${pr.changedFiles} files, ${pr.commits} commits`,
      `Reviews: ${reviewCount} (${approvalCount} approvals)`,
      'Diff (first 3000 chars):',
      diff.slice(0, 3000),
      'Respond with JSON only:',
      '{',
      '"summary": "one sentence plain English description of what this PR does",',
      '"riskFlags": ["flag1", "flag2"]',
      '}',
      'Valid riskFlags values only: "large diff", "no test changes", "single reviewer", "no approvals", "touches auth", "modifies migrations", "draft PR merged"',
    ].join('\n');
  }

  private async callOpenAI(
    pr: PullRequest,
    diff: string,
    reviewCount: number,
    approvalCount: number,
  ): Promise<AIInsightResponse | null> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: this.buildUserPrompt(pr, diff, reviewCount, approvalCount),
          },
        ],
        max_tokens: 300,
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        return null;
      }

      const parsed = JSON.parse(content) as AIInsightResponse;
      const riskFlags = (parsed.riskFlags ?? []).filter((flag) =>
        VALID_RISK_FLAGS.has(flag),
      );

      await this.prisma.aIInsight.upsert({
        where: { prId: pr.id },
        create: {
          prId: pr.id,
          summary: parsed.summary,
          riskFlags,
          model: this.model,
          promptTokens: completion.usage?.prompt_tokens ?? null,
          outputTokens: completion.usage?.completion_tokens ?? null,
        },
        update: {
          summary: parsed.summary,
          riskFlags,
          model: this.model,
          promptTokens: completion.usage?.prompt_tokens ?? null,
          outputTokens: completion.usage?.completion_tokens ?? null,
          generatedAt: new Date(),
        },
      });

      return {
        summary: parsed.summary,
        riskFlags,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate AI insight for PR ${pr.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    }
  }
}
