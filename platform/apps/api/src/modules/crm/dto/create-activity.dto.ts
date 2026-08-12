import { IsEnum, IsISO8601, IsOptional, IsString, MinLength } from "class-validator";
import { ActivityType } from "@prisma/client";

export class CreateActivityDto {
  @IsEnum(ActivityType) type: ActivityType = ActivityType.TASK;
  @IsString() @MinLength(2) title!: string;
  @IsOptional() @IsISO8601() dueAt?: string;
  @IsOptional() @IsString() dealId?: string;
}
