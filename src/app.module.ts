import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TypeOrmModule } from '@nestjs/typeorm'
import { join } from 'path'
import { validateEnv } from '@/config/env.validation'
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter'
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor'
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { RolesGuard } from '@/modules/auth/guards/roles.guard'
import { AuthModule } from '@/modules/auth/auth.module'
import { UsersModule } from '@/modules/users/users.module'
import { LocationsModule } from '@/modules/locations/locations.module'
import { CategoriesModule } from '@/modules/categories/categories.module'
import { UnitsModule } from '@/modules/units/units.module'
import { ProductsModule } from '@/modules/products/products.module'
import { ListingsModule } from '@/modules/listings/listings.module'
import { MediaModule } from '@/modules/media/media.module'
import { FavoritesModule } from '@/modules/favorites/favorites.module'
import { ReportsModule } from '@/modules/reports/reports.module'
import { ReviewsModule } from '@/modules/reviews/reviews.module'
import { NotificationsModule } from '@/modules/notifications/notifications.module'
import { ModerationModule } from '@/modules/moderation/moderation.module'
import { ChatModule } from '@/modules/chat/chat.module'
import { SavedSearchesModule } from '@/modules/saved-searches/saved-searches.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const driver = config.get<string>('MEDIA_DRIVER', 'local')
        if (driver !== 'local') return []
        return [
          {
            rootPath: join(process.cwd(), config.get<string>('MEDIA_LOCAL_DIR', 'uploads')),
            serveRoot: '/uploads',
          },
        ]
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [__dirname + '/modules/**/entities/*.entity{.ts,.js}'],
        // Schema changes go through migrations (npm run migration:*), never auto-sync —
        // see GUIDELINES.md on treating schema changes carefully.
        synchronize: false,
      }),
    }),
    AuthModule,
    UsersModule,
    LocationsModule,
    CategoriesModule,
    UnitsModule,
    ProductsModule,
    ListingsModule,
    MediaModule,
    FavoritesModule,
    ReportsModule,
    ReviewsModule,
    NotificationsModule,
    ModerationModule,
    ChatModule,
    SavedSearchesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
