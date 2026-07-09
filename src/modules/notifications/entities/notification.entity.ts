import { BaseEntity } from '@/common/entities/base.entity'
import { Column, Entity, Index } from 'typeorm'

export enum NotificationType {
  LISTING_APPROVED = 'LISTING_APPROVED',
  LISTING_REJECTED = 'LISTING_REJECTED',
  LISTING_REPORTED = 'LISTING_REPORTED',
  NEW_REVIEW = 'NEW_REVIEW',
}

@Entity('notifications')
@Index(['userId', 'isRead'])
export class Notification extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType

  @Column()
  title!: string

  @Column({ type: 'text' })
  body!: string

  @Column({ default: false })
  isRead!: boolean

  @Column({ type: 'uuid', nullable: true })
  relatedEntityId!: string | null
}
