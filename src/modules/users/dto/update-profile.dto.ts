import { IsOptional, IsString, IsUUID } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  whatsapp?: string

  @IsOptional()
  @IsUUID()
  locationId?: string

  @IsOptional()
  @IsString()
  avatarUrl?: string
}
