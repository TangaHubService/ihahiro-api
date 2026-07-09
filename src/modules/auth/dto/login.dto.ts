import { IsString, MinLength } from 'class-validator'

export class LoginDto {
  // Accepts either an email or a phone number — resolved in the service.
  @IsString()
  @MinLength(1)
  identifier!: string

  @IsString()
  @MinLength(1)
  password!: string
}
