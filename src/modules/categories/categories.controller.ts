import { Body, Controller, Get, Header, Post } from '@nestjs/common'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Public } from '@/common/decorators/public.decorator'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Approved categories change rarely (admin/moderator action) — safe to cache briefly.
  @Public()
  @Get()
  @Header('Cache-Control', 'public, max-age=300')
  findActive() {
    return this.categoriesService.findActive()
  }

  @Post()
  create(@Body() dto: CreateCategoryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.categoriesService.create(dto, user.id, user.role)
  }
}
