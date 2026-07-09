import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateReviewDto } from './dto/create-review.dto'
import { Review } from './entities/review.entity'

@Injectable()
export class ReviewsService {
  constructor(@InjectRepository(Review) private readonly reviewsRepository: Repository<Review>) {}

  async create(dto: CreateReviewDto, reviewerId: string): Promise<Review> {
    if (dto.userId === reviewerId) {
      throw new BadRequestException('You cannot review yourself')
    }

    const existing = await this.reviewsRepository.findOne({
      where: { reviewerId, targetUserId: dto.userId, listingId: dto.listingId ?? undefined },
    })
    if (existing) {
      throw new ConflictException('You already reviewed this seller for this listing')
    }

    const review = this.reviewsRepository.create({
      reviewerId,
      targetUserId: dto.userId,
      listingId: dto.listingId ?? null,
      rating: dto.rating,
      comment: dto.comment ?? null,
    })

    return this.reviewsRepository.save(review)
  }

  async listForUser(userId: string) {
    const reviews = await this.reviewsRepository.find({
      where: { targetUserId: userId },
      relations: { reviewer: true },
      order: { createdAt: 'DESC' },
    })

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      listingId: review.listingId,
      createdAt: review.createdAt,
      reviewer: review.reviewer
        ? { id: review.reviewer.id, firstName: review.reviewer.firstName, lastName: review.reviewer.lastName }
        : null,
    }))
  }

  async getStats(userId: string): Promise<{ averageRating: number; reviewCount: number }> {
    const raw = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.targetUserId = :userId', { userId })
      .getRawOne<{ avg: string | null; count: string }>()

    const avg = raw?.avg ?? null
    const count = raw?.count ?? '0'

    return {
      averageRating: avg ? Math.round(Number(avg) * 10) / 10 : 0,
      reviewCount: Number(count ?? 0),
    }
  }
}
