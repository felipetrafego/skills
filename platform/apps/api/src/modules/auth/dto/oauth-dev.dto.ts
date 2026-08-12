import { IsEmail, IsIn, IsString, MinLength } from "class-validator";

export class OAuthDevDto {
  @IsIn(["google", "microsoft", "apple"]) provider!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(2) name!: string;
  @IsString() providerAccountId!: string;
}
