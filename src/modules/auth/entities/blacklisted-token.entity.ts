import { BaseEntity } from '@/common/entities/base.entity'
import { Column, Entity, Index } from 'typeorm'

@Entity('blacklisted_tokens')
export class BlacklistedToken extends BaseEntity {
  // jti of an access token revoked before its natural expiry (e.g. on logout).
  // Checked on every authenticated request; safe to prune once past expiresAt.
  @Index({ unique: true })
  @Column()
  jti!: string

  @Column({ type: 'timestamptz' })
  expiresAt!: Date
}
