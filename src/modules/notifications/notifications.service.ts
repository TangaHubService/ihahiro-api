import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { paginate } from '@/common/types/paginated-result'
import { Notification, NotificationType } from './entities/notification.entity'

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly notificationsRepository: Repository<Notification>) {}

  async create(userId: string, type: NotificationType, title: string, body: string, relatedEntityId?: string) {
    const notification = this.notificationsRepository.create({
      userId,
      type,
      title,
      body,
      relatedEntityId: relatedEntityId ?? null,
    })
    return this.notificationsRepository.save(notification)
  }

  async list(userId: string, page: number, limit: number) {
    const [items, total] = await this.notificationsRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })
    return paginate(items, total, page, limit)
  }

  unreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({ where: { userId, isRead: false } })
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.notificationsRepository.update({ id, userId }, { isRead: true })
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationsRepository.update({ userId, isRead: false }, { isRead: true })
  }
}
