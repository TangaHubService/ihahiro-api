import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import * as fs from 'fs'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  const mediaDir = configService.get<string>('MEDIA_LOCAL_DIR', 'uploads')
  fs.mkdirSync(mediaDir, { recursive: true })

  app.enableCors({ origin: configService.get<string>('WEB_APP_ORIGIN', 'http://localhost:3000') })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  )

  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1')
  app.setGlobalPrefix(apiPrefix)

  const port = configService.get<number>('PORT', 4000)
  await app.listen(port)
  // eslint-disable-next-line no-console
  console.log(`Ihahiro API listening on port ${port} (prefix: /${apiPrefix})`)
}

bootstrap()
