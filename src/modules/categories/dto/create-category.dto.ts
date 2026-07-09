import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator'

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  name!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUUID()
  parentId?: string
}
