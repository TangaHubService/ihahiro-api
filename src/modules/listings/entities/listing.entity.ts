import { BaseEntity } from '@/common/entities/base.entity'
import { Location } from '@/modules/locations/entities/location.entity'
import { Product } from '@/modules/products/entities/product.entity'
import { Unit } from '@/modules/units/entities/unit.entity'
import { User } from '@/modules/users/entities/user.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { ListingStatus } from './listing-status.enum'
import { ListingMedia } from '@/modules/media/entities/listing-media.entity'

@Entity('listings')
@Index(['status', 'createdAt'])
export class Listing extends BaseEntity {
  @Column({ type: 'uuid' })
  sellerId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sellerId' })
  seller?: User

  @Column({ type: 'uuid' })
  productId!: string

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product?: Product

  @Column({ type: 'uuid' })
  unitId!: string

  @ManyToOne(() => Unit, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unitId' })
  unit?: Unit

  @Column({ type: 'uuid', nullable: true })
  locationId!: string | null

  @ManyToOne(() => Location, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'locationId' })
  location?: Location | null

  @Column()
  title!: string

  @Column({ type: 'text' })
  description!: string

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: { to: (value: number) => value, from: (value: string) => Number(value) },
  })
  price!: number

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: { to: (value: number) => value, from: (value: string) => Number(value) },
  })
  quantity!: number

  @Column({ type: 'enum', enum: ListingStatus, default: ListingStatus.DRAFT })
  status!: ListingStatus

  // Optional per-listing contact override — falls back to the seller's profile phone
  // when not set, since a seller may want a different number for a specific listing.
  @Column({ type: 'varchar', nullable: true })
  contactPhone!: string | null

  @Column({ type: 'varchar', nullable: true })
  contactWhatsapp!: string | null

  @Column({ type: 'varchar', nullable: true })
  qualityGrade!: string | null

  @Column({ type: 'text', nullable: true })
  deliveryNote!: string | null

  @Column({ default: 0 })
  viewCount!: number

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt!: Date | null

  @Column({ type: 'text', nullable: true })
  rejectionReason!: string | null

  @OneToMany(() => ListingMedia, (media) => media.listing)
  media?: ListingMedia[]
}
