import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Public } from '@/common/decorators/public.decorator'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'
import { CreateListingDto } from './dto/create-listing.dto'
import { FindListingsQueryDto } from './dto/find-listings-query.dto'
import { UpdateListingDto } from './dto/update-listing.dto'
import { ListingStatus } from './entities/listing-status.enum'
import { ListingsService } from './listings.service'

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Public()
  @Get()
  findAll(@Query() query: FindListingsQueryDto) {
    // Public browsing is always restricted to published listings regardless of what a
    // caller passes in — /listings/my is the only route that can see other statuses.
    return this.listingsService.findMany({ ...query, status: ListingStatus.PUBLISHED })
  }

  @Get('my')
  findMine(@Query() query: FindListingsQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.listingsService.findMany({ ...query, sellerId: user.id })
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.listingsService.findById(id, { incrementViews: true })
  }

  @Post()
  create(@Body() dto: CreateListingDto, @CurrentUser() user: AuthenticatedUser) {
    return this.listingsService.create(dto, user.id)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateListingDto, @CurrentUser() user: AuthenticatedUser) {
    return this.listingsService.update(id, dto, user.id)
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.listingsService.submit(id, user.id)
  }

  @Post(':id/archive')
  archive(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.listingsService.archive(id, user.id)
  }
}
