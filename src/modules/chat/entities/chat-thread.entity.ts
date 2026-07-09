import { BaseEntity } from '@/common/entities/base.entity'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { User } from '@/modules/users/entities/user.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('chat_threads')
export class ChatThread extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  listingId!: string | null

  @ManyToOne(() => Listing, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'listingId' })
  listing?: Listing | null

  @Column({ type: 'uuid' })
  buyerId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyerId' })
  buyer?: User

  @Column({ type: 'uuid' })
  sellerId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sellerId' })
  seller?: User

  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt!: Date | null
}
