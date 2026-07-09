import { BaseEntity } from '@/common/entities/base.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('categories')
export class Category extends BaseEntity {
  @Column()
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ type: 'uuid', nullable: true })
  parentId!: string | null

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent?: Category | null

  @Column({ type: 'varchar', nullable: true })
  imageUrl!: string | null

  // Categories created by admins/moderators are active immediately; categories created by
  // regular sellers from the post-listing flow start inactive (hidden from public browsing)
  // until a moderator approves them, so free-text taxonomy input can't pollute search/filter
  // menus unsupervised.
  @Column({ default: true })
  isActive!: boolean

  @Column({ type: 'uuid', nullable: true })
  createdById!: string | null
}
