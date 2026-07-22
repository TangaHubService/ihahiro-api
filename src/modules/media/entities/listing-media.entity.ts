import { BaseEntity } from '@/common/entities/base.entity'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('listing_media')
export class ListingMedia extends BaseEntity {
  @Column({ type: 'uuid' })
  listingId!: string

  @ManyToOne(() => Listing, (listing) => listing.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing?: Listing

  @Column()
  url!: string

  @Column({ type: 'varchar', nullable: true })
  fileId!: string | null

  @Column({ type: 'enum', enum: MediaType, default: MediaType.IMAGE })
  type!: MediaType

  @Column({ default: 0 })
  order!: number
}
