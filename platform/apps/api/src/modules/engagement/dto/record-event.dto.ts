import { IsEnum, IsOptional, IsString } from "class-validator";
import { ListingEventType } from "@prisma/client";

export class RecordEventDto {
  @IsEnum(ListingEventType) type!: ListingEventType;
  @IsOptional() @IsString() source?: string;
}
