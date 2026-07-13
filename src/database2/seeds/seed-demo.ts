// Seeds one demo account per role/use-case (admin, moderator, buyer, seller,
// buyer+seller) plus a handful of pending categories/products/listings so the
// moderation dashboard has real data to approve/reject/filter/sort.
//
// Idempotent and non-destructive: every insert is find-or-create, so this is
// safe to re-run and safe to run alongside seed:products / seed:admin.
//
// Usage: npm run seed:demo
import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as bcrypt from 'bcrypt'
import { AppDataSource } from '../data-source'
import { User } from '@/modules/users/entities/user.entity'
import { UserRole } from '@/common/enums/user-role.enum'
import { Category } from '@/modules/categories/entities/category.entity'
import { Unit } from '@/modules/units/entities/unit.entity'
import { Product } from '@/modules/products/entities/product.entity'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { ListingStatus } from '@/modules/listings/entities/listing-status.enum'

dotenv.config()

const BCRYPT_ROUNDS = 12

const DEMO_USERS = [
  {
    email: 'admin@ihahiro.rw',
    password: 'admin123',
    firstName: 'Demo',
    lastName: 'Admin',
    role: UserRole.ADMIN,
    isBuyer: false,
    isSeller: false,
  },
  {
    email: 'moderator@ihahiro.rw',
    password: 'moderator123',
    firstName: 'Demo',
    lastName: 'Moderator',
    role: UserRole.MODERATOR,
    isBuyer: false,
    isSeller: false,
  },
  {
    email: 'buyer@ihahiro.rw',
    password: 'buyer123',
    firstName: 'Demo',
    lastName: 'Buyer',
    role: UserRole.USER,
    isBuyer: true,
    isSeller: false,
  },
  {
    email: 'seller@ihahiro.rw',
    password: 'seller123',
    firstName: 'Demo',
    lastName: 'Seller',
    role: UserRole.USER,
    isBuyer: false,
    isSeller: true,
  },
  {
    email: 'buyerseller@ihahiro.rw',
    password: 'buyerseller123',
    firstName: 'Demo',
    lastName: 'BuyerSeller',
    role: UserRole.USER,
    isBuyer: true,
    isSeller: true,
  },
] as const

async function findOrCreateUser(
  repo: ReturnType<typeof AppDataSource.getRepository<User>>,
  def: (typeof DEMO_USERS)[number],
  phoneSuffix: string
): Promise<User> {
  let user = await repo.findOne({ where: { email: def.email } })
  if (user) return user

  const passwordHash = await bcrypt.hash(def.password, BCRYPT_ROUNDS)
  user = repo.create({
    email: def.email,
    passwordHash,
    firstName: def.firstName,
    lastName: def.lastName,
    phone: `+25078800${phoneSuffix}`,
    isBuyer: def.isBuyer,
    isSeller: def.isSeller,
    role: def.role,
    isVerified: true,
    isActive: true,
  })
  await repo.save(user)
  console.log(`Created ${def.role} user: ${def.email} / ${def.password}`)
  return user
}

async function findOrCreateCategory(
  repo: ReturnType<typeof AppDataSource.getRepository<Category>>,
  name: string,
  opts: { isActive: boolean; createdById?: string | null } = { isActive: true }
): Promise<Category> {
  let category = await repo.findOne({ where: { name } })
  if (!category) {
    category = await repo.save(
      repo.create({ name, isActive: opts.isActive, createdById: opts.createdById ?? null })
    )
    console.log(`Created category: ${name} (${opts.isActive ? 'active' : 'pending'})`)
  }
  return category
}

async function findOrCreateUnit(
  repo: ReturnType<typeof AppDataSource.getRepository<Unit>>,
  def: { name: string; slug: string; shortName: string }
): Promise<Unit> {
  let unit = await repo.findOne({ where: { slug: def.slug } })
  if (!unit) {
    unit = await repo.save(repo.create(def))
    console.log(`Created unit: ${def.name}`)
  }
  return unit
}

async function findOrCreateProduct(
  repo: ReturnType<typeof AppDataSource.getRepository<Product>>,
  def: { name: string; categoryId: string; unitId: string; isActive: boolean; createdById?: string | null }
): Promise<Product> {
  let product = await repo.findOne({ where: { name: def.name } })
  if (!product) {
    product = await repo.save(
      repo.create({
        name: def.name,
        categoryId: def.categoryId,
        unitId: def.unitId,
        isActive: def.isActive,
        createdById: def.createdById ?? null,
      })
    )
    console.log(`Created product: ${def.name} (${def.isActive ? 'active' : 'pending'})`)
  }
  return product
}

async function findOrCreateListing(
  repo: ReturnType<typeof AppDataSource.getRepository<Listing>>,
  def: {
    sellerId: string
    productId: string
    unitId: string
    title: string
    description: string
    price: number
    quantity: number
    status: ListingStatus
  }
): Promise<void> {
  const existing = await repo.findOne({ where: { title: def.title, sellerId: def.sellerId } })
  if (existing) return

  await repo.save(
    repo.create({
      sellerId: def.sellerId,
      productId: def.productId,
      unitId: def.unitId,
      title: def.title,
      description: def.description,
      price: def.price,
      quantity: def.quantity,
      status: def.status,
      publishedAt: def.status === ListingStatus.PUBLISHED ? new Date() : null,
    })
  )
  console.log(`Created listing: "${def.title}" (${def.status})`)
}

async function run() {
  await AppDataSource.initialize()

  const userRepo = AppDataSource.getRepository(User)
  const categoryRepo = AppDataSource.getRepository(Category)
  const unitRepo = AppDataSource.getRepository(Unit)
  const productRepo = AppDataSource.getRepository(Product)
  const listingRepo = AppDataSource.getRepository(Listing)

  console.log('--- Users ---')
  const users: Record<string, User> = {}
  let phoneCounter = 10
  for (const def of DEMO_USERS) {
    users[def.email] = await findOrCreateUser(userRepo, def, String(phoneCounter++).padStart(3, '0'))
  }
  const seller = users['seller@ihahiro.rw']
  const buyerSeller = users['buyerseller@ihahiro.rw']

  console.log('\n--- Baseline catalog (active) ---')
  const vegetables = await findOrCreateCategory(categoryRepo, 'Vegetables')
  const kg = await findOrCreateUnit(unitRepo, { name: 'Kilogram', slug: 'kg', shortName: 'Kg' })
  const litre = await findOrCreateUnit(unitRepo, { name: 'Litre', slug: 'litre', shortName: 'L' })
  const onions = await findOrCreateProduct(productRepo, {
    name: 'Onions',
    categoryId: vegetables.id,
    unitId: kg.id,
    isActive: true,
  })

  console.log('\n--- Pending categories (for moderation) ---')
  const herbsSpices = await findOrCreateCategory(categoryRepo, 'Herbs & Spices', {
    isActive: false,
    createdById: seller.id,
  })
  await findOrCreateCategory(categoryRepo, 'Dairy Products', { isActive: false, createdById: buyerSeller.id })

  console.log('\n--- Pending products (for moderation) ---')
  const ginger = await findOrCreateProduct(productRepo, {
    name: 'Ginger',
    categoryId: vegetables.id,
    unitId: kg.id,
    isActive: false,
    createdById: seller.id,
  })
  await findOrCreateProduct(productRepo, {
    name: 'Fresh Milk',
    categoryId: herbsSpices.id,
    unitId: litre.id,
    isActive: false,
    createdById: buyerSeller.id,
  })

  console.log('\n--- Listings (mixed statuses, for moderation) ---')
  await findOrCreateListing(listingRepo, {
    sellerId: seller.id,
    productId: onions.id,
    unitId: kg.id,
    title: 'Fresh Red Onions — Bulk Supply',
    description: 'Freshly harvested red onions, sorted and bagged, ready for wholesale.',
    price: 700,
    quantity: 2000,
    status: ListingStatus.PUBLISHED,
  })
  await findOrCreateListing(listingRepo, {
    sellerId: seller.id,
    productId: onions.id,
    unitId: kg.id,
    title: 'Organic White Onions',
    description: 'Small-batch organic white onions from a family farm.',
    price: 850,
    quantity: 500,
    status: ListingStatus.PENDING_REVIEW,
  })
  await findOrCreateListing(listingRepo, {
    sellerId: buyerSeller.id,
    productId: ginger.id,
    unitId: kg.id,
    title: 'Fresh Ginger Bulk Supply',
    description: 'Aromatic fresh ginger root, cleaned and sorted, sold by the kilogram.',
    price: 1800,
    quantity: 300,
    status: ListingStatus.PENDING_REVIEW,
  })

  console.log('\nDemo seed complete. Login credentials:')
  for (const def of DEMO_USERS) {
    console.log(`  ${def.role.padEnd(10)} ${def.email} / ${def.password}`)
  }

  await AppDataSource.destroy()
}

run().catch((error) => {
  console.error('Demo seed failed:', error)
  process.exit(1)
})
