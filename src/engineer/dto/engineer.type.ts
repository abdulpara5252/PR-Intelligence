import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EngineerType {
  @Field(() => String)
  login!: string;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field(() => Int)
  totalPRs!: number;

  @Field(() => Int)
  mergedPRs!: number;

  @Field(() => Int)
  totalReviews!: number;

  @Field(() => Float, { nullable: true })
  avgCycleTimeHours?: number | null;

  @Field(() => Float, { nullable: true })
  avgRiskScore?: number | null;

  @Field(() => Float, { nullable: true })
  reviewParticipation?: number | null;
}
