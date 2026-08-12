import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Fuel, Transmission } from "@prisma/client";

export class CreateVehicleDto {
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsString() make!: string;
  @IsString() model!: string;
  @IsOptional() @IsString() version?: string;

  @Type(() => Number) @IsInt() yearModel!: number;
  @Type(() => Number) @IsInt() yearFab!: number;
  @Type(() => Number) @IsNumber() @Min(0) price!: number;

  @Type(() => Number) @IsInt() @Min(0) mileageKm = 0;

  @IsEnum(Fuel) fuel: Fuel = Fuel.FLEX;
  @IsEnum(Transmission) transmission: Transmission = Transmission.MANUAL;

  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() fipeCode?: string;
}
