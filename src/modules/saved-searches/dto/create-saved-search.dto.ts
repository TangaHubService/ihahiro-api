import { IsObject, IsOptional, IsString } from 'class-validator'

export class CreateSavedSearchDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsObject()
  filters!: Record<string, unknown>
}
