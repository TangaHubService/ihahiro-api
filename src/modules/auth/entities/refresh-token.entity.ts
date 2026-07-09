import { BaseEntity } from '@/common/entities/base.entity'
import { User } from '@/modules/users/entities/user.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User

  // We only ever store a hash of the refresh token, never the raw value —
  // a DB read alone must not be enough to impersonate a session.
  @Index({ unique: true })
  @Column()
  tokenHash!: string

  @Column({ type: 'timestamptz' })
  expiresAt!: Date

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt!: Date | null
}
