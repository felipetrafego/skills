import { IsEnum, IsString, MinLength } from "class-validator";
import { MediaType } from "@prisma/client";

export class PresignDto {
  @IsString() @MinLength(1) filename!: string;
  @IsString() contentType!: string;
  @IsEnum(MediaType) type: MediaType = MediaType.PHOTO;
}
