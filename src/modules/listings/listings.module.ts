import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LocationsModule } from '@/modules/locations/locations.module'
import { Location } from '@/modules/locations/entities/location.entity'
import { Listing } from './entities/listing.entity'
import { ListingsController } from './listings.controller'
import { ListingsService } from './listings.service'

@Module({
  imports: [TypeOrmModule.forFeature([Listing, Location]), LocationsModule],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}
