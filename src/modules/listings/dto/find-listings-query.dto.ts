import { Type } from 'class-transformer'
import { IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'
import { ListingStatus } from '../entities/listing-status.enum'

export class FindListingsQueryDto {
  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @IsUUID()
  locationId?: string

  @IsOptional()
  @IsUUID()
  productId?: string

  @IsOptional()
  @IsUUID()
  categoryId?: string

  @IsOptional()
  @IsUUID()
  sellerId?: string

  @IsOptional()
  @IsUUID()
  excludeId?: string

  @IsOptional()
  @IsIn(Object.values(ListingStatus))
  status?: ListingStatus

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 12

  @IsOptional()
  @IsIn(['createdAt', 'price'])
  sortBy: 'createdAt' | 'price' = 'createdAt'

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc'
}
