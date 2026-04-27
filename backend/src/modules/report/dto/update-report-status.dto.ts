import { IsIn, IsString } from "class-validator";

export class UpdateReportStatusDto {
  @IsString()
  @IsIn(["PENDING", "RESOLVED", "REJECTED"])
  status!: string;
}
