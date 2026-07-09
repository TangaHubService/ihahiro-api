import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Unit } from './entities/unit.entity'

@Injectable()
export class UnitsService {
  constructor(@InjectRepository(Unit) private readonly unitsRepository: Repository<Unit>) {}

  findAll(): Promise<Unit[]> {
    return this.unitsRepository.find({ order: { name: 'ASC' } })
  }
}
