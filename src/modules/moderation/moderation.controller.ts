import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user-role.enum'
import { RejectListingDto } from './dto/reject-listing.dto'
import { ModerationService } from './moderation.service'

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('pending')
  findPendingListings(@Query() query: PaginationQueryDto) {
    return this.moderationService.findPendingListings(query.page, query.limit)
  }

  @Get('stats')
  getStats() {
    return this.moderationService.getStats()
  }

  @Post('listing/:id/approve')
  approveListing(@Param('id') id: string) {
    return this.moderationService.approveListing(id)
  }

  @Post('listing/:id/reject')
  rejectListing(@Param('id') id: string, @Body() dto: RejectListingDto) {
    return this.moderationService.rejectListing(id, dto.reason)
  }

  @Get('categories/pending')
  findPendingCategories() {
    return this.moderationService.findPendingCategories()
  }

  @Post('categories/:id/approve')
  approveCategory(@Param('id') id: string) {
    return this.moderationService.approveCategory(id)
  }

  @Get('products/pending')
  findPendingProducts() {
    return this.moderationService.findPendingProducts()
  }

  @Post('products/:id/approve')
  approveProduct(@Param('id') id: string) {
    return this.moderationService.approveProduct(id)
  }
}
