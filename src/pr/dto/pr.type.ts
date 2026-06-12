import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PRMetricsType {
  @Field(() => Float, { nullable: true })
  cycleTimeHours?: number | null;

  @Field(() => Float, { nullable: true })
  reviewTimeHours?: number | null;

  @Field(() => Int)
  reviewCount!: number;

  @Field(() => Int)
  approvalCount!: number;

  @Field(() => Int)
  commentCount!: number;

  @Field(() => Float, { nullable: true })
  riskScore?: number | null;

  @Field(() => Boolean)
  hasTestChanges!: boolean;
}

@ObjectType()
export class PRReviewType {
  @Field(() => String)
  reviewerLogin!: string;

  @Field(() => String)
  state!: string;

  @Field(() => String, { nullable: true })
  body?: string | null;

  @Field(() => Date)
  submittedAt!: Date;
}

@ObjectType()
export class AIInsightType {
  @Field(() => String)
  summary!: string;

  @Field(() => [String])
  riskFlags!: string[];

  @Field(() => Date)
  generatedAt!: Date;
}

@ObjectType()
export class PullRequestType {
  @Field(() => String)
  id!: string;

  @Field(() => Int)
  externalId!: number;

  @Field(() => String)
  repoFullName!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  body?: string | null;

  @Field(() => String)
  authorLogin!: string;

  @Field(() => String)
  state!: string;

  @Field(() => Boolean)
  isDraft!: boolean;

  @Field(() => Int)
  additions!: number;

  @Field(() => Int)
  deletions!: number;

  @Field(() => Int)
  changedFiles!: number;

  @Field(() => Int)
  commits!: number;

  @Field(() => String)
  htmlUrl!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date, { nullable: true })
  mergedAt?: Date | null;

  @Field(() => PRMetricsType, { nullable: true })
  metrics?: PRMetricsType | null;

  @Field(() => [PRReviewType], { nullable: true })
  reviews?: PRReviewType[];

  @Field(() => AIInsightType, { nullable: true })
  aiInsight?: AIInsightType | null;
}
