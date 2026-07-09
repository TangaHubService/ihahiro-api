import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @IsString()
  @MinLength(1)
  firstName!: string

  @IsString()
  @MinLength(1)
  lastName!: string

  @IsEmail()
  email!: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsOptional()
  @IsBoolean()
  isBuyer?: boolean

  @IsOptional()
  @IsBoolean()
  isSeller?: boolean
}
