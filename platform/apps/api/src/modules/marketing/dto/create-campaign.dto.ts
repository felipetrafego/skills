import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateCampaignDto {
  @IsString() @MinLength(2) name!: string;
  @IsIn(["META", "GOOGLE", "TIKTOK", "SEO", "EMAIL"]) channel!: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) budget?: number;
  @IsOptional() @IsString() utmSource?: string;
  @IsOptional() @IsString() utmMedium?: string;
  @IsOptional() @IsString() utmCampaign?: string;
}
