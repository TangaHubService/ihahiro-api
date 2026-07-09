import { BaseEntity } from '@/common/entities/base.entity'
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm'

export enum LocationType {
  PROVINCE = 'province',
  DISTRICT = 'district',
  SECTOR = 'sector',
  CELL = 'cell',
  VILLAGE = 'village',
}

@Entity('locations')
@Index(['type', 'parentId'])
export class Location extends BaseEntity {
  @Column()
  name!: string

  @Column({ type: 'enum', enum: LocationType })
  type!: LocationType

  @Column({ type: 'uuid', nullable: true })
  parentId!: string | null

  @ManyToOne(() => Location, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent?: Location | null

  // Materialized ancestor chain (root-first order of ancestor ids), computed on create.
  // Lets us fetch a full breadcrumb in one query instead of walking parentId recursively.
  @Column({ type: 'uuid', array: true, default: () => "'{}'" })
  ancestorIds!: string[]

  @Column({ type: 'double precision', nullable: true })
  latitude!: number | null

  @Column({ type: 'double precision', nullable: true })
  longitude!: number | null
}
