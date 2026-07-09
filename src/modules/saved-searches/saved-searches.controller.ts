import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'
import { CreateSavedSearchDto } from './dto/create-saved-search.dto'
import { SavedSearchesService } from './saved-searches.service'

@Controller('saved-searches')
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.savedSearchesService.list(user.id)
  }

  @Post()
  create(@Body() dto: CreateSavedSearchDto, @CurrentUser() user: AuthenticatedUser) {
    return this.savedSearchesService.create(dto, user.id)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.savedSearchesService.remove(id, user.id)
  }
}
