import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateSavedSearchDto } from './dto/create-saved-search.dto'
import { SavedSearch } from './entities/saved-search.entity'

@Injectable()
export class SavedSearchesService {
  constructor(@InjectRepository(SavedSearch) private readonly savedSearchesRepository: Repository<SavedSearch>) {}

  list(userId: string): Promise<SavedSearch[]> {
    return this.savedSearchesRepository.find({ where: { userId }, order: { createdAt: 'DESC' } })
  }

  create(dto: CreateSavedSearchDto, userId: string): Promise<SavedSearch> {
    return this.savedSearchesRepository.save(
      this.savedSearchesRepository.create({ userId, name: dto.name ?? null, filters: dto.filters })
    )
  }

  async remove(id: string, userId: string): Promise<void> {
    const existing = await this.savedSearchesRepository.findOne({ where: { id, userId } })
    if (!existing) throw new NotFoundException('Saved search not found')
    await this.savedSearchesRepository.remove(existing)
  }
}
