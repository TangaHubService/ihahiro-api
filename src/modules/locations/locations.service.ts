import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, In, IsNull, Repository } from 'typeorm'
import { Location, LocationType } from './entities/location.entity'

const SEARCH_LIMIT = 20

@Injectable()
export class LocationsService {
  constructor(@InjectRepository(Location) private readonly locationsRepository: Repository<Location>) {}

  findByType(type: LocationType, parentId?: string): Promise<Location[]> {
    if (type === LocationType.PROVINCE) {
      return this.locationsRepository.find({ where: { type }, order: { name: 'ASC' } })
    }

    if (!parentId) {
      return Promise.resolve([])
    }

    return this.locationsRepository.find({ where: { type, parentId }, order: { name: 'ASC' } })
  }

  async findById(id: string): Promise<Location> {
    const location = await this.locationsRepository.findOne({ where: { id } })
    if (!location) throw new NotFoundException('Location not found')
    return location
  }

  async findAncestors(location: Location): Promise<Location[]> {
    if (location.ancestorIds.length === 0) return []
    const ancestors = await this.locationsRepository.find({ where: { id: In(location.ancestorIds) } })
    // Preserve root-first order.
    const byId = new Map(ancestors.map((a) => [a.id, a]))
    return location.ancestorIds.map((id) => byId.get(id)).filter((a): a is Location => Boolean(a))
  }

  search(query: string): Promise<Location[]> {
    if (!query.trim()) return Promise.resolve([])
    return this.locationsRepository.find({
      where: { name: ILike(`%${query.trim()}%`) },
      order: { name: 'ASC' },
      take: SEARCH_LIMIT,
    })
  }

  async create(data: { name: string; type: LocationType; parentId?: string | null; latitude?: number; longitude?: number }) {
    let ancestorIds: string[] = []

    if (data.parentId) {
      const parent = await this.findById(data.parentId)
      ancestorIds = [...parent.ancestorIds, parent.id]
    }

    const location = this.locationsRepository.create({
      name: data.name,
      type: data.type,
      parentId: data.parentId ?? null,
      ancestorIds,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    })

    return this.locationsRepository.save(location)
  }

  countRoots() {
    return this.locationsRepository.count({ where: { parentId: IsNull() } })
  }
}
