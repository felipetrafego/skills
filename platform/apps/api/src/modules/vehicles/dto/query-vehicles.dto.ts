import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Fuel, Transmission } from "@prisma/client";

export class QueryVehiclesDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() make?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;

  @IsOptional() @IsEnum(Fuel) fuel?: Fuel;
  @IsOptional() @IsEnum(Transmission) transmission?: Transmission;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0) minPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) maxPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1900) minYear?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(60) pageSize = 24;

  /** relevance | price_asc | price_desc | newest */
  @IsOptional() @IsString() sort?: string;
}
