import { IsEnum, IsString, MinLength } from "class-validator";
import { Channel } from "@prisma/client";

export class CreateTemplateDto {
  @IsString() @MinLength(2) name!: string;
  @IsEnum(Channel) channel: Channel = Channel.WHATSAPP;
  @IsString() @MinLength(1) body!: string;
}
