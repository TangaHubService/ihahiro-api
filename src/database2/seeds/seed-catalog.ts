import { AppDataSource } from '../data-source'
import { Category } from '@/modules/categories/entities/category.entity'
import { Unit } from '@/modules/units/entities/unit.entity'
import { Product } from '@/modules/products/entities/product.entity'

const CATEGORIES = ['Grains', 'Legumes', 'Vegetables', 'Fruits', 'Tubers', 'Other']

const UNITS: Array<{ name: string; slug: string; shortName: string }> = [
  { name: 'Kilogram', slug: 'kg', shortName: 'Kg' },
  { name: 'Bag', slug: 'bag', shortName: 'Bag' },
  { name: 'Basket', slug: 'basket', shortName: 'Basket' },
  { name: 'Litre', slug: 'litre', shortName: 'L' },
  { name: 'Piece', slug: 'piece', shortName: 'Pc' },
]

const PRODUCTS: Array<{ name: string; category: string }> = [
  { name: 'Potatoes', category: 'Tubers' },
  { name: 'Sweet Potatoes', category: 'Tubers' },
  { name: 'Cassava', category: 'Tubers' },
  { name: 'Carrots', category: 'Vegetables' },
  { name: 'Onions', category: 'Vegetables' },
  { name: 'Tomatoes', category: 'Vegetables' },
  { name: 'Cabbage', category: 'Vegetables' },
  { name: 'Beans', category: 'Legumes' },
  { name: 'Maize', category: 'Grains' },
  { name: 'Rice', category: 'Grains' },
  { name: 'Bananas', category: 'Fruits' },
  { name: 'Avocado', category: 'Fruits' },
]

async function run() {
  await AppDataSource.initialize()
  const categoryRepo = AppDataSource.getRepository(Category)
  const unitRepo = AppDataSource.getRepository(Unit)
  const productRepo = AppDataSource.getRepository(Product)

  const categoryByName = new Map<string, Category>()
  for (const name of CATEGORIES) {
    let category = await categoryRepo.findOne({ where: { name } })
    if (!category) {
      category = await categoryRepo.save(categoryRepo.create({ name, isActive: true }))
      console.log(`Created category: ${name}`)
    }
    categoryByName.set(name, category)
  }

  let kgUnit: Unit | null = null
  for (const unitDef of UNITS) {
    let unit = await unitRepo.findOne({ where: { slug: unitDef.slug } })
    if (!unit) {
      unit = await unitRepo.save(unitRepo.create(unitDef))
      console.log(`Created unit: ${unitDef.name}`)
    }
    if (unitDef.slug === 'kg') kgUnit = unit
  }

  for (const productDef of PRODUCTS) {
    const category = categoryByName.get(productDef.category)
    if (!category) continue

    const existing = await productRepo.findOne({ where: { name: productDef.name } })
    if (!existing) {
      await productRepo.save(
        productRepo.create({
          name: productDef.name,
          categoryId: category.id,
          unitId: kgUnit?.id ?? null,
          isActive: true,
        })
      )
      console.log(`Created product: ${productDef.name}`)
    }
  }

  console.log('Catalog seed complete.')
  await AppDataSource.destroy()
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
