import { BaseEntity } from '@/common/entities/base.entity'
import { UserRole } from '@/common/enums/user-role.enum'
import { Location } from '@/modules/locations/entities/location.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column()
  email!: string

  @Column()
  passwordHash!: string

  @Column()
  firstName!: string

  @Column()
  lastName!: string

  @Index({ unique: true, where: 'phone IS NOT NULL' })
  @Column({ type: 'varchar', nullable: true })
  phone!: string | null

  @Column({ type: 'varchar', nullable: true })
  whatsapp!: string | null

  @Column({ default: true })
  isBuyer!: boolean

  @Column({ default: false })
  isSeller!: boolean

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole

  @Column({ type: 'varchar', nullable: true })
  avatarUrl!: string | null

  @Column({ type: 'uuid', nullable: true })
  locationId!: string | null

  @ManyToOne(() => Location, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'locationId' })
  location?: Location | null

  // Phone/ID verification status — separate from role. A verified badge is a trust
  // signal shown to buyers, not a permission grant.
  @Column({ default: false })
  isVerified!: boolean

  // Soft-disable for moderation (banning) without deleting the account or its history.
  @Column({ default: true })
  isActive!: boolean
}
