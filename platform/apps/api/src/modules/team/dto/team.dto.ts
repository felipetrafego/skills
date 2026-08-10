import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";
import { MembershipRole } from "@prisma/client";

export class InviteMemberDto {
  @IsString() @MinLength(2) name!: string;
  @IsEmail() email!: string;
  @IsEnum(MembershipRole) role: MembershipRole = MembershipRole.SELLER;
}

export class ChangeRoleDto {
  @IsEnum(MembershipRole) role!: MembershipRole;
}
