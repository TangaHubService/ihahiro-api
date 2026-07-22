import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StorageModule } from '@/common/storage/storage.module'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { ListingMedia } from './entities/listing-media.entity'
import { MediaController } from './media.controller'
import { MediaService } from './media.service'

@Module({
  imports: [TypeOrmModule.forFeature([ListingMedia, Listing]), StorageModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
