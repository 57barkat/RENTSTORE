import { IsString } from "class-validator";

export class AuthGoogleDto {
  @IsString()
  idToken: string;
}
