import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator'
import { ReportReason } from '../entities/report.entity'

export class CreateReportDto {
  @IsUUID()
  listingId!: string

  @IsEnum(ReportReason)
  reason!: ReportReason

  @IsOptional()
  @IsString()
  message?: string
}
