import { IsBoolean, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class CreateLandingDto {
  @IsString() @Matches(/^[a-z0-9-]+$/, { message: "slug deve conter apenas letras minúsculas, números e hífen" })
  slug!: string;

  @IsString() @MinLength(2) title!: string;
  @IsString() @MinLength(2) headline!: string;
  @IsOptional() @IsString() subheadline?: string;
  @IsOptional() @IsString() ctaText?: string;
  @IsOptional() @IsString() ctaUrl?: string;
}

export class UpdateLandingDto {
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() headline?: string;
  @IsOptional() @IsString() subheadline?: string;
  @IsOptional() @IsString() ctaText?: string;
  @IsOptional() @IsString() ctaUrl?: string;
}
