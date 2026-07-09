import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { ListingMedia, MediaType } from './entities/listing-media.entity'

const MAX_ORDER = 5

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(ListingMedia) private readonly mediaRepository: Repository<ListingMedia>,
    @InjectRepository(Listing) private readonly listingsRepository: Repository<Listing>,
    private readonly configService: ConfigService
  ) {}

  async addFromUpload(params: {
    listingId: string
    requesterId: string
    filename: string
    order?: number
  }): Promise<ListingMedia> {
    const listing = await this.listingsRepository.findOne({ where: { id: params.listingId } })
    if (!listing) throw new NotFoundException('Listing not found')
    if (listing.sellerId !== params.requesterId) {
      throw new ForbiddenException('You do not own this listing')
    }

    const currentCount = await this.mediaRepository.count({ where: { listingId: params.listingId } })
    const baseUrl = this.configService.get<string>('MEDIA_PUBLIC_BASE_URL', 'http://localhost:4000/uploads')

    const media = this.mediaRepository.create({
      listingId: params.listingId,
      url: `${baseUrl}/${params.filename}`,
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

    await this.mediaRepository.delete({ id, listingId })
  }
}
