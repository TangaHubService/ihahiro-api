import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoriesModule } from '@/modules/categories/categories.module'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { ListingsModule } from '@/modules/listings/listings.module'
import { NotificationsModule } from '@/modules/notifications/notifications.module'
import { ProductsModule } from '@/modules/products/products.module'
import { ModerationController } from './moderation.controller'
import { ModerationService } from './moderation.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing]),
    ListingsModule,
    CategoriesModule,
    ProductsModule,
    NotificationsModule,
  ],
  controllers: [ModerationController],
  providers: [ModerationService],
})
export class ModerationModule {}
