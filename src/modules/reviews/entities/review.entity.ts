import { BaseEntity } from '@/common/entities/base.entity'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { User } from '@/modules/users/entities/user.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('reviews')
@Index(['reviewerId', 'targetUserId', 'listingId'], { unique: true })
export class Review extends BaseEntity {
  @Column({ type: 'uuid' })
  reviewerId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewerId' })
  reviewer?: User

  @Column({ type: 'uuid' })
  targetUserId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetUserId' })
  targetUser?: User

  @Column({ type: 'uuid', nullable: true })
  listingId!: string | null

  @ManyToOne(() => Listing, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'listingId' })
  listing?: Listing | null

  @Column({ type: 'smallint' })
  rating!: number

  @Column({ type: 'text', nullable: true })
  comment!: string | null
}
