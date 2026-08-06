import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { MediaType } from "@prisma/client";

export class ConfirmMediaDto {
  @IsString() url!: string;
  @IsOptional() @IsString() thumbUrl?: string;
  @IsEnum(MediaType) type: MediaType = MediaType.PHOTO;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) position?: number;
}
