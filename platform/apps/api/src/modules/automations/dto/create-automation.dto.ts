import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { ActivityType } from "@prisma/client";

export enum TriggerType {
  LEAD_CREATED = "LEAD_CREATED",
  DEAL_WON = "DEAL_WON",
  VEHICLE_SOLD = "VEHICLE_SOLD",
}
export enum ActionType {
  SEND_MESSAGE = "SEND_MESSAGE",
  CREATE_ACTIVITY = "CREATE_ACTIVITY",
}

export class CreateAutomationDto {
  @IsString() @MinLength(2) name!: string;
  @IsEnum(TriggerType) trigger!: TriggerType;
  @IsEnum(ActionType) action!: ActionType;

  @IsOptional() @IsString() body?: string; // SEND_MESSAGE
  @IsOptional() @IsEnum(ActivityType) activityType?: ActivityType; // CREATE_ACTIVITY
  @IsOptional() @IsString() activityTitle?: string; // CREATE_ACTIVITY
}
