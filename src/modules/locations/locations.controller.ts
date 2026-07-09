import { Controller, Get, Header, Param, Query } from '@nestjs/common'
import { Public } from '@/common/decorators/public.decorator'
import { LocationType } from './entities/location.entity'
import { toLocationResponse } from './dto/location-response.dto'
import { LocationsService } from './locations.service'

// Rwanda's administrative geography (province -> ... -> village) essentially never
// changes at runtime, so every route here is safe to cache aggressively.
const GEO_CACHE_CONTROL = 'public, max-age=3600'

@Public()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('provinces')
  @Header('Cache-Control', GEO_CACHE_CONTROL)
  async provinces() {
    const items = await this.locationsService.findByType(LocationType.PROVINCE)
    return items.map((item) => toLocationResponse(item))
  }

  @Get('districts')
  @Header('Cache-Control', GEO_CACHE_CONTROL)
  async districts(@Query('parentId') parentId?: string) {
    const items = await this.locationsService.findByType(LocationType.DISTRICT, parentId)
    return items.map((item) => toLocationResponse(item))
  }

  @Get('sectors')
  @Header('Cache-Control', GEO_CACHE_CONTROL)
  async sectors(@Query('parentId') parentId?: string) {
    const items = await this.locationsService.findByType(LocationType.SECTOR, parentId)
    return items.map((item) => toLocationResponse(item))
  }

  @Get('cells')
  @Header('Cache-Control', GEO_CACHE_CONTROL)
  async cells(@Query('parentId') parentId?: string) {
    const items = await this.locationsService.findByType(LocationType.CELL, parentId)
    return items.map((item) => toLocationResponse(item))
  }

  @Get('villages')
  @Header('Cache-Control', GEO_CACHE_CONTROL)
  async villages(@Query('parentId') parentId?: string) {
    const items = await this.locationsService.findByType(LocationType.VILLAGE, parentId)
    return items.map((item) => toLocationResponse(item))
  }

  @Get('search')
  @Header('Cache-Control', GEO_CACHE_CONTROL)
  async search(@Query('q') q = '') {
    const items = await this.locationsService.search(q)
    return items.map((item) => toLocationResponse(item))
  }

  @Get(':id')
  @Header('Cache-Control', GEO_CACHE_CONTROL)
  async findOne(@Param('id') id: string) {
    const location = await this.locationsService.findById(id)
    const ancestors = await this.locationsService.findAncestors(location)
    return toLocationResponse(location, ancestors)
  }
}
