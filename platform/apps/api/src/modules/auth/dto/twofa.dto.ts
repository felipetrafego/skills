import { IsString, Length } from "class-validator";

export class TwoFaCodeDto {
  @IsString() @Length(6, 6) code!: string;
}

export class TwoFaLoginDto {
  @IsString() challenge!: string;
  @IsString() @Length(6, 6) code!: string;
}
