import { BaseEntity } from '@/common/entities/base.entity'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { User } from '@/modules/users/entities/user.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

export enum ReportReason {
  SCAM = 'SCAM',
  DUPLICATE = 'DUPLICATE',
  INAPPROPRIATE = 'INAPPROPRIATE',
  WRONG_INFO = 'WRONG_INFO',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  DISMISSED = 'DISMISSED',
  ACTION_TAKEN = 'ACTION_TAKEN',
}

@Entity('reports')
export class Report extends BaseEntity {
  @Column({ type: 'uuid' })
  reporterId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporterId' })
  reporter?: User

  @Column({ type: 'uuid' })
  listingId!: string

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing?: Listing

  @Column({ type: 'enum', enum: ReportReason })
  reason!: ReportReason

  @Column({ type: 'text', nullable: true })
  message!: string | null

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status!: ReportStatus

  @Column({ type: 'uuid', nullable: true })
  resolvedById!: string | null

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null
}
