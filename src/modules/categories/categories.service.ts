import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserRole } from '@/common/enums/user-role.enum'
import { Category } from './entities/category.entity'
import { CreateCategoryDto } from './dto/create-category.dto'

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly categoriesRepository: Repository<Category>) {}

  findActive(): Promise<Category[]> {
    return this.categoriesRepository.find({ where: { isActive: true }, order: { name: 'ASC' } })
  }

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } })
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } })
    if (!category) throw new NotFoundException('Category not found')
    return category
  }

  create(dto: CreateCategoryDto, createdById: string, creatorRole: UserRole): Promise<Category> {
    const isPrivileged = creatorRole === UserRole.ADMIN || creatorRole === UserRole.MODERATOR

    const category = this.categoriesRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      parentId: dto.parentId ?? null,
      isActive: isPrivileged,
      createdById,
    })

    return this.categoriesRepository.save(category)
  }

  async approve(id: string): Promise<Category> {
    const category = await this.findById(id)
    category.isActive = true
    return this.categoriesRepository.save(category)
  }

  findPending(): Promise<Category[]> {
    return this.categoriesRepository.find({ where: { isActive: false }, order: { createdAt: 'ASC' } })
  }
}
