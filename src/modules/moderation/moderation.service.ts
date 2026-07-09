import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { paginate } from '@/common/types/paginated-result'
import { CategoriesService } from '@/modules/categories/categories.service'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { ListingStatus } from '@/modules/listings/entities/listing-status.enum'
import { ListingsService } from '@/modules/listings/listings.service'
import { NotificationsService } from '@/modules/notifications/notifications.service'
import { NotificationType } from '@/modules/notifications/entities/notification.entity'
import { ProductsService } from '@/modules/products/products.service'

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(Listing) private readonly listingsRepository: Repository<Listing>,
    private readonly listingsService: ListingsService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly notificationsService: NotificationsService
  ) {}

  async findPendingListings(page: number, limit: number) {
    const [items, total] = await this.listingsRepository.findAndCount({
      where: { status: ListingStatus.PENDING_REVIEW },
      relations: { seller: true, product: true },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return paginate(
      items.map((l) => ({
        id: l.id,
        title: l.title,
        price: l.price,
        createdAt: l.createdAt,
        seller: l.seller ? { id: l.seller.id, firstName: l.seller.firstName, lastName: l.seller.lastName } : null,
        product: l.product ? { id: l.product.id, name: l.product.name } : null,
      })),
      total,
      page,
      limit
    )
  }

  async approveListing(id: string) {
    const listing = await this.getPendingListing(id)
    listing.status = ListingStatus.PUBLISHED
    listing.publishedAt = new Date()
    listing.rejectionReason = null
    await this.listingsRepository.save(listing)

    await this.notificationsService.create(
      listing.sellerId,
      NotificationType.LISTING_APPROVED,
      'Your listing was approved',
      `"${listing.title}" is now live on Ihahiro.`,
      listing.id
    )

    return this.listingsService.findById(id)
  }

  async rejectListing(id: string, reason: string) {
    const listing = await this.getPendingListing(id)
    listing.status = ListingStatus.REJECTED
    listing.rejectionReason = reason
    await this.listingsRepository.save(listing)

    await this.notificationsService.create(
      listing.sellerId,
      NotificationType.LISTING_REJECTED,
      'Your listing needs changes',
      `"${listing.title}" was not approved: ${reason}`,
      listing.id
    )

    return this.listingsService.findById(id)
  }

  async getStats() {
    const [pending, published, rejected, archived] = await Promise.all([
      this.listingsRepository.count({ where: { status: ListingStatus.PENDING_REVIEW } }),
      this.listingsRepository.count({ where: { status: ListingStatus.PUBLISHED } }),
      this.listingsRepository.count({ where: { status: ListingStatus.REJECTED } }),
      this.listingsRepository.count({ where: { status: ListingStatus.ARCHIVED } }),
    ])

    const [pendingCategories, pendingProducts] = await Promise.all([
      this.categoriesService.findPending(),
      this.productsService.findPending(),
    ])

    return {
      listings: { pending, published, rejected, archived },
      pendingCategories: pendingCategories.length,
      pendingProducts: pendingProducts.length,
    }
  }

  findPendingCategories() {
    return this.categoriesService.findPending()
  }

  approveCategory(id: string) {
    return this.categoriesService.approve(id)
  }

  findPendingProducts() {
    return this.productsService.findPending()
  }

  approveProduct(id: string) {
    return this.productsService.approve(id)
  }

  private async getPendingListing(id: string): Promise<Listing> {
    const listing = await this.listingsRepository.findOne({ where: { id } })
    if (!listing) throw new NotFoundException('Listing not found')
    if (listing.status !== ListingStatus.PENDING_REVIEW) {
      throw new NotFoundException('Listing is not pending review')
    }
    return listing
  }
}
