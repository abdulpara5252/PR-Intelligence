import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import type { Configuration } from '../config/configuration';

export interface GitHubPullRequest {
  number: number;
  title: string;
  body: string | null;
  state: string;
  draft: boolean;
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  html_url: string;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  user: {
    login: string;
  };
  base: {
    ref: string;
  };
  head: {
    ref: string;
  };
}

export interface GitHubPullRequestReview {
  id: number;
  user: {
    login: string;
  } | null;
  state: string;
  body: string | null;
  submitted_at: string | null;
}

@Injectable()
export class GitHubApiService {
  private readonly octokit: Octokit;

  constructor(private readonly configService: ConfigService<Configuration, true>) {
    this.octokit = new Octokit({
      auth: this.configService.get('github.token', { infer: true }),
    });
  }

  async getPR(
    owner: string,
    repo: string,
    prNumber: number,
  ): Promise<GitHubPullRequest> {
    const response = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    return response.data as GitHubPullRequest;
  }

  async getPRDiff(owner: string, repo: string, prNumber: number): Promise<string> {
    const response = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType: {
        format: 'diff',
      },
    });

    return String(response.data);
  }

  async getPRReviews(
    owner: string,
    repo: string,
    prNumber: number,
  ): Promise<GitHubPullRequestReview[]> {
    const response = await this.octokit.pulls.listReviews({
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });

    return response.data as GitHubPullRequestReview[];
  }

  async listRepoPRs(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open',
  ): Promise<GitHubPullRequest[]> {
    const response = await this.octokit.pulls.list({
      owner,
      repo,
      state,
      per_page: 100,
    });

    return response.data as unknown as GitHubPullRequest[];
  }
}
