import { Controller, Get, Param, Query } from '@nestjs/common'
import { Public } from '@/common/decorators/public.decorator'
import { LocationType } from './entities/location.entity'
import { toLocationResponse } from './dto/location-response.dto'
import { LocationsService } from './locations.service'

@Public()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('provinces')
  async provinces() {
    const items = await this.locationsService.findByType(LocationType.PROVINCE)
    return items.map((item) => toLocationResponse(item))
  }

  @Get('districts')
  async districts(@Query('parentId') parentId?: string) {
    const items = await this.locationsService.findByType(LocationType.DISTRICT, parentId)
    return items.map((item) => toLocationResponse(item))
  }

  @Get('sectors')
  async sectors(@Query('parentId') parentId?: string) {
    const items = await this.locationsService.findByType(LocationType.SECTOR, parentId)
    return items.map((item) => toLocationResponse(item))
  }

  @Get('cells')
  async cells(@Query('parentId') parentId?: string) {
    const items = await this.locationsService.findByType(LocationType.CELL, parentId)
    return items.map((item) => toLocationResponse(item))
  }

  @Get('villages')
  async villages(@Query('parentId') parentId?: string) {
    const items = await this.locationsService.findByType(LocationType.VILLAGE, parentId)
    return items.map((item) => toLocationResponse(item))
  }

  @Get('search')
  async search(@Query('q') q = '') {
    const items = await this.locationsService.search(q)
    return items.map((item) => toLocationResponse(item))
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const location = await this.locationsService.findById(id)
    const ancestors = await this.locationsService.findAncestors(location)
    return toLocationResponse(location, ancestors)
  }
}
