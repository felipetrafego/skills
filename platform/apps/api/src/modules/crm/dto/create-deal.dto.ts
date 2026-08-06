import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateDealDto {
  @IsString() leadId!: string;
  @IsOptional() @IsString() vehicleId?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) value?: number;
  @IsOptional() @IsString() assignedTo?: string;
}
