export interface AppConfig {
  port: number;
  nodeEnv: string;
}

export interface DatabaseConfig {
  url: string;
}

export interface RedisConfig {
  url: string;
}

export interface GitHubConfig {
  webhookSecret: string;
  token: string;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  github: GitHubConfig;
  openai: OpenAIConfig;
}

export default (): Configuration => ({
  app: {
    port: parseInt(process.env.PORT ?? '3001', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  github: {
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET ?? '',
    token: process.env.GITHUB_TOKEN ?? '',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: process.env.OPENAI_MODEL ?? 'gpt-4o',
  },
});
