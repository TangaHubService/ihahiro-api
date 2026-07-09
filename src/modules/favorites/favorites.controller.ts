import { Controller, Get, Param, Post } from '@nestjs/common'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'
import { FavoritesService } from './favorites.service'

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.favoritesService.list(user.id)
  }

  @Post(':listingId')
  toggle(@Param('listingId') listingId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.favoritesService.toggle(user.id, listingId)
  }
}
