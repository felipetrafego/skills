import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateOfferDto {
  @IsUUID() vehicleId!: string;
  @IsUUID() partnerId!: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) amount?: number;
  @IsOptional() @IsString() notes?: string;
}
