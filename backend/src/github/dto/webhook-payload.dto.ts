export interface WebhookUserDto {
  login: string;
}

export interface WebhookPullRequestDto {
  number: number;
  title: string;
  body?: string;
  state: string;
  draft: boolean;
  user: WebhookUserDto;
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  html_url: string;
  created_at: string;
  updated_at: string;
  merged_at?: string;
  closed_at?: string;
  base: { ref: string };
  head: { ref: string };
  merged?: boolean;
}

export interface WebhookRepositoryDto {
  full_name: string;
  owner: WebhookUserDto;
}

export interface WebhookPayloadDto {
  action: string;
  pull_request?: WebhookPullRequestDto;
  repository: WebhookRepositoryDto;
}
