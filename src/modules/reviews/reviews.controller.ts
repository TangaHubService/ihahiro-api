import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Public } from '@/common/decorators/public.decorator'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'
import { CreateReviewDto } from './dto/create-review.dto'
import { ReviewsService } from './reviews.service'

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.create(dto, user.id)
  }

  @Public()
  @Get('user/:userId')
  listForUser(@Param('userId') userId: string) {
    return this.reviewsService.listForUser(userId)
  }

  @Public()
  @Get('user/:userId/stats')
  getStats(@Param('userId') userId: string) {
    return this.reviewsService.getStats(userId)
  }
}
