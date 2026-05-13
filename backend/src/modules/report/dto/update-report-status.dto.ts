import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

const REPORT_STATUS_VALUES = [
  "pending",
  "reviewed",
  "dismissed",
  "removed",
  "PENDING",
  "RESOLVED",
  "REJECTED",
] as const;

export class UpdateReportStatusDto {
  @IsOptional()
  @IsString()
  @IsIn(REPORT_STATUS_VALUES)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  actionTaken?: string;
}
