import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ListingsModule } from '@/modules/listings/listings.module'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { Favorite } from './entities/favorite.entity'
import { FavoritesController } from './favorites.controller'
import { FavoritesService } from './favorites.service'

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Listing]), ListingsModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
