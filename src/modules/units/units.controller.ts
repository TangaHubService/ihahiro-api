import { Controller, Get, Header } from '@nestjs/common'
import { Public } from '@/common/decorators/public.decorator'
import { UnitsService } from './units.service'

@Public()
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  // Units of measure (kg, ton, ...) are effectively static reference data.
  @Get()
  @Header('Cache-Control', 'public, max-age=3600')
  findAll() {
    return this.unitsService.findAll()
  }
}
