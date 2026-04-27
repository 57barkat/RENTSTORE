import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCheckoutDto {
  @IsString()
  @IsIn(["single", "standard", "pro", "featured_boost"])
  packageId!: string;
}

export class VerifyPaymentQueryDto {
  @IsString()
  @IsNotEmpty()
  tracker!: string;
}

export class PaymentSuccessQueryDto {
  @IsString()
  @IsNotEmpty()
  tracker!: string;
}

export class SafepayNotificationDto {
  @IsOptional()
  data?: {
    token?: string;
    notification?: {
      state?: string;
      tracker?: string;
      intent?: string;
    };
  };
}
