import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { ListingsService } from '@/modules/listings/listings.service'
import { Favorite } from './entities/favorite.entity'

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite) private readonly favoritesRepository: Repository<Favorite>,
    @InjectRepository(Listing) private readonly listingsRepository: Repository<Listing>,
    private readonly listingsService: ListingsService
  ) {}

  async toggle(userId: string, listingId: string): Promise<{ favorited: boolean }> {
    const listing = await this.listingsRepository.findOne({ where: { id: listingId } })
    if (!listing) throw new NotFoundException('Listing not found')

    const existing = await this.favoritesRepository.findOne({ where: { userId, listingId } })

    if (existing) {
      await this.favoritesRepository.remove(existing)
      return { favorited: false }
    }

    await this.favoritesRepository.save(this.favoritesRepository.create({ userId, listingId }))
    return { favorited: true }
  }

  async listListingIds(userId: string): Promise<string[]> {
    const favorites = await this.favoritesRepository.find({ where: { userId } })
    return favorites.map((f) => f.listingId)
  }

  async list(userId: string) {
    const favorites = await this.favoritesRepository.find({ where: { userId }, order: { createdAt: 'DESC' } })
    return this.listingsService.findByIds(favorites.map((f) => f.listingId))
  }
}
