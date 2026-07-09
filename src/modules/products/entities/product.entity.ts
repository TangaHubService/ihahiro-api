import { BaseEntity } from '@/common/entities/base.entity'
import { Category } from '@/modules/categories/entities/category.entity'
import { Unit } from '@/modules/units/entities/unit.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ type: 'uuid' })
  categoryId!: string

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category?: Category

  @Column({ type: 'uuid', nullable: true })
  unitId!: string | null

  @ManyToOne(() => Unit, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'unitId' })
  unit?: Unit | null

  // Same moderation gate as Category — see isActive comment there.
  @Column({ default: true })
  isActive!: boolean

  @Column({ type: 'uuid', nullable: true })
  createdById!: string | null
}
