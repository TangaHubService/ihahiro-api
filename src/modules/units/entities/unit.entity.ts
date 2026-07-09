import { BaseEntity } from '@/common/entities/base.entity'
import { Column, Entity, Index } from 'typeorm'

@Entity('units')
export class Unit extends BaseEntity {
  @Column()
  name!: string

  @Index({ unique: true })
  @Column()
  slug!: string

  @Column({ type: 'varchar', nullable: true })
  shortName!: string | null
}
