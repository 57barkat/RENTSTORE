import { IsNotEmpty, IsString, Matches, Length } from "class-validator";

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: "Phone must be a valid international or local digit string.",
  })
  phone!: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: "Phone must be a valid international or local digit string.",
  })
  phone!: string;

  @IsString()
  @Length(6, 6)
  otp!: string;
}
