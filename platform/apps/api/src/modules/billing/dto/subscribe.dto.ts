import { IsEnum } from "class-validator";
import { PaymentMethod } from "@prisma/client";

export class SubscribeDto {
  @IsEnum(PaymentMethod) paymentMethod: PaymentMethod = PaymentMethod.PIX;
}
