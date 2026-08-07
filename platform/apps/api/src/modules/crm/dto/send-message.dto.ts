import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Channel } from "@prisma/client";

export class SendMessageDto {
  @IsString() leadId!: string;
  @IsEnum(Channel) channel: Channel = Channel.WHATSAPP;
  @IsString() @MinLength(1) body!: string;
  @IsOptional() @IsString() templateId?: string;
}
