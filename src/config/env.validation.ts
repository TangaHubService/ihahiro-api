import { Type } from 'class-transformer'
import { plainToInstance } from 'class-transformer'
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, validateSync } from 'class-validator'

class EnvironmentVariables {
  @IsIn(['development', 'production', 'test'])
  @IsOptional()
  NODE_ENV = 'development'

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT = 4000

  @IsString()
  @IsOptional()
  API_PREFIX = 'api/v1'

  @IsString()
  @IsNotEmpty()
  DB_HOST!: string

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  DB_PORT = 5432

  @IsString()
  @IsNotEmpty()
  DB_USERNAME!: string

  @IsString()
  @IsOptional()
  DB_PASSWORD = ''

  @IsString()
  @IsNotEmpty()
  DB_DATABASE!: string

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET!: string

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN = '15m'

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN = '30d'

  @IsString()
  @IsOptional()
  WEB_APP_ORIGIN = 'http://localhost:3000'

  @IsIn(['local'])
  @IsOptional()
  MEDIA_DRIVER = 'local'

  @IsString()
  @IsOptional()
  MEDIA_LOCAL_DIR = 'uploads'

  @IsString()
  @IsOptional()
  MEDIA_PUBLIC_BASE_URL = 'http://localhost:4000/uploads'

  @IsString()
  @IsOptional()
  CLOUDINARY_CLOUD_NAME?: string

  @IsString()
  @IsOptional()
  CLOUDINARY_API_KEY?: string

  @IsString()
  @IsOptional()
  CLOUDINARY_API_SECRET?: string

  @IsString()
  @IsOptional()
  AWS_S3_BUCKET?: string

  @IsString()
  @IsOptional()
  AWS_REGION?: string

  @IsString()
  @IsOptional()
  AWS_ACCESS_KEY_ID?: string

  @IsString()
  @IsOptional()
  AWS_SECRET_ACCESS_KEY?: string

  @IsString()
  @IsOptional()
  AWS_S3_PUBLIC_BASE_URL?: string
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })
  const errors = validateSync(validatedConfig, { skipMissingProperties: false })

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ')
    throw new Error(`Invalid environment configuration: ${messages}`)
  }

  return validatedConfig
}
