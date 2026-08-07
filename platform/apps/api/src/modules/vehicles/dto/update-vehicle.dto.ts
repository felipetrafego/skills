import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Fuel, Transmission, VehicleStatus } from "@prisma/client";

export class UpdateVehicleDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) price?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) mileageKm?: number;
  @IsOptional() @IsEnum(Fuel) fuel?: Fuel;
  @IsOptional() @IsEnum(Transmission) transmission?: Transmission;
  @IsOptional() @IsEnum(VehicleStatus) status?: VehicleStatus;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @Type(() => Number) @IsInt() yearFab?: number;
  @IsOptional() @Type(() => Number) @IsInt() yearModel?: number;
}
