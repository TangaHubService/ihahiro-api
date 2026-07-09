import { BaseEntity } from '@/common/entities/base.entity'
import { Column, Entity } from 'typeorm'

@Entity('saved_searches')
export class SavedSearch extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string

  @Column({ type: 'varchar', nullable: true })
  name!: string | null

  // Stores a serialized FindListingsQueryDto — this is a saved filter preset, not a
  // relational query, so jsonb is the right fit rather than columns per filter field.
  @Column({ type: 'jsonb' })
  filters!: Record<string, unknown>
}
