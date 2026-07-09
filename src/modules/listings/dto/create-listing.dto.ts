import { IsIn, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MinLength } from 'class-validator'
import { ListingStatus } from '../entities/listing-status.enum'

export class CreateListingDto {
  @IsString()
  @MinLength(1)
  title!: string

  @IsString()
  description!: string

  @IsNumber()
  @IsPositive()
  price!: number

  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantity?: number

  @IsUUID()
  unitId!: string

  @IsUUID()
  productId!: string

  @IsOptional()
  @IsUUID()
  locationId?: string

  @IsOptional()
  @IsString()
  contactPhone?: string

  @IsOptional()
  @IsString()
  contactWhatsapp?: string

  @IsOptional()
  @IsString()
  qualityGrade?: string

  @IsOptional()
  @IsString()
  deliveryNote?: string

  @IsOptional()
  @IsIn([ListingStatus.DRAFT, ListingStatus.PENDING_REVIEW])
  status?: ListingStatus.DRAFT | ListingStatus.PENDING_REVIEW
}
