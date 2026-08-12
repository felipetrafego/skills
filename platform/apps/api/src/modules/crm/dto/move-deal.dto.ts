import { IsEnum, IsOptional, IsString } from "class-validator";
import { DealStage } from "@prisma/client";

export class MoveDealDto {
  @IsEnum(DealStage) stage!: DealStage;
  @IsOptional() @IsString() lostReason?: string;
}
