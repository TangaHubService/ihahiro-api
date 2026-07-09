import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { UserRole } from '@/common/enums/user-role.enum'
import { CreateProductDto } from './dto/create-product.dto'
import { FindProductsQueryDto } from './dto/find-products-query.dto'
import { Product } from './entities/product.entity'

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private readonly productsRepository: Repository<Product>) {}

  findActive(query: FindProductsQueryDto): Promise<Product[]> {
    return this.productsRepository.find({
      where: {
        isActive: true,
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.search ? { name: ILike(`%${query.search}%`) } : {}),
      },
      relations: { category: true, unit: true },
      order: { name: 'ASC' },
    })
  }

  findPending(): Promise<Product[]> {
    return this.productsRepository.find({ where: { isActive: false }, order: { createdAt: 'ASC' } })
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { category: true, unit: true },
    })
    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  create(dto: CreateProductDto, createdById: string, creatorRole: UserRole): Promise<Product> {
    const isPrivileged = creatorRole === UserRole.ADMIN || creatorRole === UserRole.MODERATOR

    const product = this.productsRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      categoryId: dto.categoryId,
      unitId: dto.unitId ?? null,
      isActive: isPrivileged,
      createdById,
    })

    return this.productsRepository.save(product)
  }

  async approve(id: string): Promise<Product> {
    const product = await this.findById(id)
    product.isActive = true
    return this.productsRepository.save(product)
  }
}
