import { Controller, Get } from '@nestjs/common'
import { Public } from '@/common/decorators/public.decorator'
import { UnitsService } from './units.service'

@Public()
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  findAll() {
    return this.unitsService.findAll()
  }
}
