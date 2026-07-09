import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Public } from '@/common/decorators/public.decorator'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'
import { CreateProductDto } from './dto/create-product.dto'
import { FindProductsQueryDto } from './dto/find-products-query.dto'
import { ProductsService } from './products.service'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  findAll(@Query() query: FindProductsQueryDto) {
    return this.productsService.findActive(query)
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findById(id)
  }

  @Post()
  create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthenticatedUser) {
    return this.productsService.create(dto, user.id, user.role)
  }
}
