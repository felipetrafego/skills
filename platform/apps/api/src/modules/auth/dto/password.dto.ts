import { IsEmail, IsString, MinLength } from "class-validator";

export class ForgotPasswordDto {
  @IsEmail() email!: string;
}

export class ResetPasswordDto {
  @IsString() @MinLength(10) token!: string;
  @IsString() @MinLength(8, { message: "A senha deve ter ao menos 8 caracteres" }) password!: string;
}

export class VerifyEmailDto {
  @IsString() @MinLength(10) token!: string;
}
