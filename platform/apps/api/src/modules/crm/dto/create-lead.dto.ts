import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { LeadSource } from "@prisma/client";

export class CreateLeadDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() vehicleId?: string;
  @IsOptional() @IsEnum(LeadSource) source?: LeadSource;
}
