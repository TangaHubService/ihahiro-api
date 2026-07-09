import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator'

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name!: string

  @IsUUID()
  categoryId!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUUID()
  unitId?: string
}
