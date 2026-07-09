import { BaseEntity } from '@/common/entities/base.entity'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { User } from '@/modules/users/entities/user.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('favorites')
@Index(['userId', 'listingId'], { unique: true })
export class Favorite extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User

  @Column({ type: 'uuid' })
  listingId!: string

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing?: Listing
}
