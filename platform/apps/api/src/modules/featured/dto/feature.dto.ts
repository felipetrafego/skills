import { IsIn } from "class-validator";

export type PaidTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export class FeatureDto {
  @IsIn(["BRONZE", "SILVER", "GOLD", "PLATINUM"])
  tier!: PaidTier;
}
