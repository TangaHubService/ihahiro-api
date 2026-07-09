import { BaseEntity } from '@/common/entities/base.entity'
import { User } from '@/modules/users/entities/user.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { ChatThread } from './chat-thread.entity'

@Entity('chat_messages')
@Index(['threadId', 'createdAt'])
export class ChatMessage extends BaseEntity {
  @Column({ type: 'uuid' })
  threadId!: string

  @ManyToOne(() => ChatThread, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'threadId' })
  thread?: ChatThread

  @Column({ type: 'uuid' })
  senderId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender?: User

  @Column({ type: 'text' })
  body!: string

  @Column({ type: 'timestamptz', nullable: true })
  readAt!: Date | null
}
