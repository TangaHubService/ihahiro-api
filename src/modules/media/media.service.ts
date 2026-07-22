import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FileUploadService } from '@/common/storage/file-upload.service'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { ListingMedia, MediaType } from './entities/listing-media.entity'

const MAX_ORDER = 5

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(ListingMedia) private readonly mediaRepository: Repository<ListingMedia>,
    @InjectRepository(Listing) private readonly listingsRepository: Repository<Listing>,
    private readonly fileUploadService: FileUploadService
  ) {}

  async addFromUpload(params: {
    listingId: string
    requesterId: string
    url: string
    fileId?: string | null
    order?: number
  }): Promise<ListingMedia> {
    const listing = await this.listingsRepository.findOne({ where: { id: params.listingId } })
    if (!listing) throw new NotFoundException('Listing not found')
    if (listing.sellerId !== params.requesterId) {
      throw new ForbiddenException('You do not own this listing')
    }

    const currentCount = await this.mediaRepository.count({ where: { listingId: params.listingId } })

    const media = this.mediaRepository.create({
      listingId: params.listingId,
      url: params.url,
      fileId: params.fileId ?? null,
      type: MediaType.IMAGE,
      order: params.order ?? Math.min(currentCount, MAX_ORDER),
    })

    return this.mediaRepository.save(media)
  }

  async list(listingId: string): Promise<ListingMedia[]> {
    return this.mediaRepository.find({ where: { listingId }, order: { order: 'ASC' } })
  }

  async remove(id: string, listingId: string, requesterId: string): Promise<void> {
    const listing = await this.listingsRepository.findOne({ where: { id: listingId } })
    if (!listing) throw new NotFoundException('Listing not found')
    if (listing.sellerId !== requesterId) {
      throw new ForbiddenException('You do not own this listing')
    }

    const media = await this.mediaRepository.findOne({ where: { id, listingId } })
    if (media?.fileId) {
      await this.fileUploadService.deleteFile(media.fileId)
    }

    await this.mediaRepository.delete({ id, listingId })
  }
}
