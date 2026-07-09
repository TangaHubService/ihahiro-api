import { IsOptional, IsString, IsUUID } from 'class-validator'

export class FindProductsQueryDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string

  @IsOptional()
  @IsString()
  search?: string
}
