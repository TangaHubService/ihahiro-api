import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { paginate } from '@/common/types/paginated-result'
import { Location } from '@/modules/locations/entities/location.entity'
import { LocationsService } from '@/modules/locations/locations.service'
import { CreateListingDto } from './dto/create-listing.dto'
import { FindListingsQueryDto } from './dto/find-listings-query.dto'
import { UpdateListingDto } from './dto/update-listing.dto'
import { Listing } from './entities/listing.entity'
import { ListingStatus } from './entities/listing-status.enum'

const RELATIONS = {
  seller: { location: true },
  product: { category: true, unit: true },
  unit: true,
  location: true,
  media: true,
} as const

// Fields that materially change what a moderator already approved. Editing any of these on a
// published listing sends it back for review instead of silently mutating an approved listing.
const FIELDS_REQUIRING_REAPPROVAL: Array<keyof CreateListingDto> = ['title', 'description', 'price', 'productId']

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing) private readonly listingsRepository: Repository<Listing>,
    @InjectRepository(Location) private readonly locationsRepository: Repository<Location>,
    private readonly locationsService: LocationsService
  ) {}

  async findMany(query: FindListingsQueryDto) {
    const qb = this.listingsRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.seller', 'seller')
      .leftJoinAndSelect('seller.location', 'sellerLocation')
      .leftJoinAndSelect('listing.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('listing.unit', 'unit')
      .leftJoinAndSelect('listing.location', 'location')
      .leftJoinAndSelect('listing.media', 'media')

    if (query.status) {
      qb.andWhere('listing.status = :status', { status: query.status })
    }

    if (query.sellerId) {
      qb.andWhere('listing.sellerId = :sellerId', { sellerId: query.sellerId })
    }

    if (query.excludeId) {
      qb.andWhere('listing.id != :excludeId', { excludeId: query.excludeId })
    }

    if (query.productId) {
      qb.andWhere('listing.productId = :productId', { productId: query.productId })
    }

    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: query.categoryId })
    }

    if (query.q) {
      qb.andWhere('(listing.title ILIKE :q OR listing.description ILIKE :q)', { q: `%${query.q}%` })
    }

    if (query.minPrice !== undefined) {
      qb.andWhere('listing.price >= :minPrice', { minPrice: query.minPrice })
    }

    if (query.maxPrice !== undefined) {
      qb.andWhere('listing.price <= :maxPrice', { maxPrice: query.maxPrice })
    }

    if (query.locationId) {
      // A listing matches if it's tagged at the exact location, or at any location that
      // descends from it (e.g. filtering by a province also surfaces listings tagged at
      // district/sector/cell/village level within that province).
      const descendantIds = await this.locationsRepository
        .createQueryBuilder('loc')
        .select('loc.id')
        .where('loc.id = :locationId', { locationId: query.locationId })
        .orWhere(':locationId = ANY(loc."ancestorIds")', { locationId: query.locationId })
        .getMany()

      qb.andWhere('listing.locationId IN (:...locationIds)', {
        locationIds: descendantIds.length > 0 ? descendantIds.map((l) => l.id) : [query.locationId],
      })
    }

    const sortColumn = query.sortBy === 'price' ? 'listing.price' : 'listing.createdAt'
    qb.orderBy(sortColumn, query.sortOrder.toUpperCase() as 'ASC' | 'DESC')

    const page = query.page ?? 1
    const limit = query.limit ?? 12
    qb.skip((page - 1) * limit).take(limit)

    const [items, total] = await qb.getManyAndCount()
    return paginate(items.map((item) => this.toResponse(item)), total, page, limit)
  }

  async findById(id: string, options: { incrementViews?: boolean } = {}) {
    const listing = await this.listingsRepository.findOne({ where: { id }, relations: RELATIONS })
    if (!listing) throw new NotFoundException('Listing not found')

    if (options.incrementViews) {
      await this.listingsRepository.increment({ id }, 'viewCount', 1)
      listing.viewCount += 1
    }

    const ancestors = listing.location ? await this.locationsService.findAncestors(listing.location) : []
    return this.toResponse(listing, ancestors)
  }

  async create(dto: CreateListingDto, sellerId: string) {
    const listing = this.listingsRepository.create({
      sellerId,
      productId: dto.productId,
      unitId: dto.unitId,
      locationId: dto.locationId ?? null,
      title: dto.title,
      description: dto.description,
      price: dto.price,
      quantity: dto.quantity ?? 0,
      contactPhone: dto.contactPhone ?? null,
      contactWhatsapp: dto.contactWhatsapp ?? null,
      qualityGrade: dto.qualityGrade ?? null,
      deliveryNote: dto.deliveryNote ?? null,
      status: dto.status ?? ListingStatus.DRAFT,
      publishedAt: null,
    })

    const saved = await this.listingsRepository.save(listing)
    return this.findById(saved.id)
  }

  async update(id: string, dto: UpdateListingDto, requesterId: string) {
    const listing = await this.getOwnedListing(id, requesterId)

    const touchesApprovedFields = FIELDS_REQUIRING_REAPPROVAL.some(
      (field) => dto[field] !== undefined && String(dto[field]) !== String((listing as never)[field])
    )

    Object.assign(listing, {
      ...dto,
      quantity: dto.quantity ?? listing.quantity,
    })

    if (listing.status === ListingStatus.PUBLISHED && touchesApprovedFields) {
      listing.status = ListingStatus.PENDING_REVIEW
      listing.publishedAt = null
    }

    await this.listingsRepository.save(listing)
    return this.findById(id)
  }

  async submit(id: string, requesterId: string) {
    const listing = await this.getOwnedListing(id, requesterId)
    listing.status = ListingStatus.PENDING_REVIEW
    await this.listingsRepository.save(listing)
    return this.findById(id)
  }

  async archive(id: string, requesterId: string) {
    const listing = await this.getOwnedListing(id, requesterId)
    listing.status = ListingStatus.ARCHIVED
    await this.listingsRepository.save(listing)
    return this.findById(id)
  }

  private async getOwnedListing(id: string, requesterId: string): Promise<Listing> {
    const listing = await this.listingsRepository.findOne({ where: { id } })
    if (!listing) throw new NotFoundException('Listing not found')
    if (listing.sellerId !== requesterId) {
      throw new ForbiddenException('You do not own this listing')
    }
    return listing
  }

  async findByIds(ids: string[]) {
    if (ids.length === 0) return []
    const listings = await this.listingsRepository.find({ where: { id: In(ids) }, relations: RELATIONS })
    const byId = new Map(listings.map((listing) => [listing.id, listing]))
    // Preserve caller-provided order (e.g. most-recently-favorited-first).
    return ids.map((id) => byId.get(id)).filter((listing): listing is Listing => Boolean(listing)).map((listing) => this.toResponse(listing))
  }

  toResponse(listing: Listing, locationAncestors: Location[] = []) {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      quantity: listing.quantity,
      unit: listing.unit
        ? { id: listing.unit.id, name: listing.unit.name, shortName: listing.unit.shortName }
        : null,
      product: listing.product
        ? {
            id: listing.product.id,
            name: listing.product.name,
            category: listing.product.category
              ? { id: listing.product.category.id, name: listing.product.category.name }
              : null,
          }
        : null,
      seller: listing.seller
        ? {
            id: listing.seller.id,
            firstName: listing.seller.firstName,
            lastName: listing.seller.lastName,
            phone: listing.seller.phone,
            avatarUrl: listing.seller.avatarUrl,
            createdAt: listing.seller.createdAt,
            location: listing.seller.location
              ? { id: listing.seller.location.id, name: listing.seller.location.name }
              : null,
          }
        : null,
      location: listing.location
        ? {
            id: listing.location.id,
            name: listing.location.name,
            type: listing.location.type,
            ...(locationAncestors.length > 0
              ? { ancestors: locationAncestors.map((a) => ({ id: a.id, name: a.name, type: a.type })) }
              : {}),
          }
        : null,
      contactPhone: listing.contactPhone,
      contactWhatsapp: listing.contactWhatsapp,
      qualityGrade: listing.qualityGrade,
      deliveryNote: listing.deliveryNote,
      status: listing.status,
      isActive: listing.status === ListingStatus.PUBLISHED,
      viewCount: listing.viewCount,
      media: (listing.media ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((m) => ({ id: m.id, url: m.url, type: m.type, order: m.order })),
      createdAt: listing.createdAt,
      publishedAt: listing.publishedAt,
    }
  }
}
