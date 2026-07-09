import { IsOptional, IsUUID } from 'class-validator'

export class CreateThreadDto {
  @IsOptional()
  @IsUUID()
  listingId?: string

  @IsUUID()
  recipientId!: string
}
