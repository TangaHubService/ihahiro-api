import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id }, relations: { location: true } })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id)
    Object.assign(user, dto)
    return this.usersRepository.save(user)
  }

  toPublicProfile(user: User) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      whatsapp: user.whatsapp,
      avatarUrl: user.avatarUrl,
      isBuyer: user.isBuyer,
      isSeller: user.isSeller,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      location: user.location ? { id: user.location.id, name: user.location.name } : null,
    }
  }
}
