import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as bcrypt from 'bcrypt'
import { Provinces, Districts, Sectors } from 'rwanda'
import { AppDataSource } from '../data-source'
import { Location, LocationType } from '@/modules/locations/entities/location.entity'
import { Category } from '@/modules/categories/entities/category.entity'
import { Product } from '@/modules/products/entities/product.entity'
import { Unit } from '@/modules/units/entities/unit.entity'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { User } from '@/modules/users/entities/user.entity'
import { ListingStatus } from '@/modules/listings/entities/listing-status.enum'
import { UserRole } from '@/common/enums/user-role.enum'
import { RWANDA_PROVINCES_WITH_DISTRICTS } from './rwanda-provinces-districts'

dotenv.config()

const PRODUCT_DEFS: Array<{
  name: string
  category: string
  description: string
  unitSlug: string
  listings: Array<{
    province: string
    district: string
    title: string
    description: string
    price: number
    quantity: number
    contactPhone?: string
    contactWhatsapp?: string
    qualityGrade?: string
    deliveryNote?: string
  }>
}> = [
  {
    name: 'Irish Potatoes',
    category: 'Tubers',
    description: 'Fresh Irish potatoes, high-quality variety suitable for chips and boiling',
    unitSlug: 'kg',
    listings: [
      { province: 'Northern Province', district: 'Musanze', title: 'Fresh Irish Potatoes from Musanze', description: 'High-quality Irish potatoes harvested this season from the volcanic soils of Musanze. Clean, sorted, and ready for market.', price: 800, quantity: 5000, qualityGrade: 'Grade A', deliveryNote: 'Available for bulk delivery within 24 hours' },
      { province: 'Southern Province', district: 'Nyamagabe', title: 'Premium Irish Potatoes', description: 'Clean, sorted Irish potatoes from Nyamagabe farms. Ideal for hotels, restaurants, and resellers.', price: 750, quantity: 3000, qualityGrade: 'Grade A', deliveryNote: 'Free delivery for orders above 500 Kg' },
    ],
  },
  {
    name: 'Maize Flour',
    category: 'Grains',
    description: 'Finely milled maize flour, perfect for ugali and porridge',
    unitSlug: 'kg',
    listings: [
      { province: 'Eastern Province', district: 'Nyagatare', title: 'Pure Maize Flour — Nyagatare Mill', description: 'Locally milled maize flour from Nyagatare. No additives, naturally gluten-free. Available in 1Kg, 5Kg, and 25Kg bags.', price: 1200, quantity: 10000, qualityGrade: 'Premium', deliveryNote: 'Bulk orders of 100Kg+ receive 5% discount' },
      { province: 'Southern Province', district: 'Ruhango', title: 'Premium Maize Flour', description: 'Fine maize flour from Ruhango region. Perfect for breakfast porridge and ugali. Milled fresh weekly.', price: 1100, quantity: 8000, deliveryNote: 'Delivered within 48 hours anywhere in the Southern Province' },
    ],
  },
  {
    name: 'Sorghum',
    category: 'Grains',
    description: 'Red and white sorghum grains, cleaned and sorted',
    unitSlug: 'kg',
    listings: [
      { province: 'Eastern Province', district: 'Kayonza', title: 'Organic Sorghum Grains', description: 'Premium sorghum grains from Kayonza. Ideal for brewing and porridge. Available in 10Kg, 50Kg, and 100Kg bags.', price: 900, quantity: 6000, qualityGrade: 'Grade A', deliveryNote: 'Call for same-day delivery within Kayonza' },
    ],
  },
  {
    name: 'Groundnuts',
    category: 'Legumes',
    description: 'Raw shelled groundnuts, sun-dried and sorted',
    unitSlug: 'kg',
    listings: [
      { province: 'Eastern Province', district: 'Gatsibo', title: 'Sun-Dried Groundnuts', description: 'High-protein groundnuts dried naturally in the sun. Perfect for snacks and peanut butter processing.', price: 1500, quantity: 4000, qualityGrade: 'Premium', deliveryNote: 'Wholesale price available for 100Kg+ orders' },
      { province: 'Southern Province', district: 'Nyanza', title: 'Fresh Groundnuts', description: 'Large-size groundnuts from Nyanza. Great for roasting and cooking Fresh from this season\'s harvest.', price: 1400, quantity: 3500, qualityGrade: 'Grade A' },
    ],
  },
  {
    name: 'Pineapples',
    category: 'Fruits',
    description: 'Sweet, ripe pineapples ready for consumption',
    unitSlug: 'piece',
    listings: [
      { province: 'Eastern Province', district: 'Bugesera', title: 'Sweet Bugesera Pineapples', description: 'Juicy, sweet pineapples from Bugesera. Naturally ripened in the sun. Perfect for fresh juice and fruit salads.', price: 2000, quantity: 2000, qualityGrade: 'Premium', deliveryNote: 'Minimum order: 50 pieces' },
      { province: 'Southern Province', district: 'Huye', title: 'Fresh Farm Pineapples', description: 'Locally grown pineapples from Huye. Naturally sweet with no added sugars.', price: 1800, quantity: 1500, deliveryNote: 'Delivered fresh within 24 hours of harvest' },
    ],
  },
  {
    name: 'Mangoes',
    category: 'Fruits',
    description: 'Ripe mangoes, various local varieties including Dodo and Apple mango',
    unitSlug: 'piece',
    listings: [
      { province: 'Eastern Province', district: 'Rwamagana', title: 'Ripe Mangoes — Rwamagana Valley', description: 'Delicious locally grown mangoes. Available in Dodo and Apple varieties. Naturally ripened and sorted by size.', price: 500, quantity: 5000, qualityGrade: 'Grade A', deliveryNote: 'Free delivery within Rwamagana district' },
    ],
  },
  {
    name: 'Tomatoes',
    category: 'Vegetables',
    description: 'Fresh, vine-ripened tomatoes',
    unitSlug: 'kg',
    listings: [
      { province: 'Kigali City', district: 'Gasabo', title: 'Fresh Tomatoes — Gasabo Farm', description: 'Vine-ripened tomatoes grown in Gasabo greenhouses. Delivered daily to Kigali markets. Perfect for cooking and salads.', price: 600, quantity: 2000, qualityGrade: 'Grade A', deliveryNote: 'Same-day delivery in Kigali for orders above 50 Kg' },
      { province: 'Northern Province', district: 'Burera', title: 'Fresh Tomatoes', description: 'Locally grown fresh tomatoes from Burera. Rich flavor, ideal for cooking and fresh consumption.', price: 550, quantity: 1500 },
    ],
  },
  {
    name: 'Passion Fruit',
    category: 'Fruits',
    description: 'Fresh purple and yellow passion fruits',
    unitSlug: 'piece',
    listings: [
      { province: 'Western Province', district: 'Rubavu', title: 'Organic Passion Fruit', description: 'Aromatic passion fruits from the Rubavu region. Rich in vitamin C, perfect for fresh juice and desserts.', price: 300, quantity: 8000, qualityGrade: 'Premium', deliveryNote: 'Bulk orders packed in crates of 100 pieces' },
      { province: 'Kigali City', district: 'Kicukiro', title: 'Fresh Passion Fruits', description: 'Farm-fresh passion fruits available in Kicukiro. Sweet and aromatic, ideal for juice making.', price: 350, quantity: 5000 },
    ],
  },
  {
    name: 'Peas',
    category: 'Legumes',
    description: 'Dried peas, sorted and cleaned',
    unitSlug: 'kg',
    listings: [
      { province: 'Northern Province', district: 'Gicumbi', title: 'Dried Peas — Gicumbi Highlands', description: 'Premium dried peas from the Gicumbi highlands. High protein content, long shelf life. Available in 10Kg and 50Kg bags.', price: 1300, quantity: 4000, qualityGrade: 'Grade A' },
    ],
  },
  {
    name: 'Soybeans',
    category: 'Legumes',
    description: 'Non-GMO soybeans for cooking and processing',
    unitSlug: 'kg',
    listings: [
      { province: 'Western Province', district: 'Rusizi', title: 'Quality Soybeans', description: 'Locally grown non-GMO soybeans from Rusizi. Ideal for soy milk, tofu, and flour production.', price: 1000, quantity: 6000, qualityGrade: 'Premium', deliveryNote: 'Wholesale pricing available for 500Kg+' },
    ],
  },
  {
    name: 'Chili Peppers',
    category: 'Vegetables',
    description: 'Fresh hot chili peppers (Akabanga style)',
    unitSlug: 'kg',
    listings: [
      { province: 'Kigali City', district: 'Nyarugenge', title: 'Fresh Chili Peppers', description: 'Locally grown hot chili peppers. Perfect for seasoning, sauce making, and drying for long-term use.', price: 2500, quantity: 500, qualityGrade: 'Premium', deliveryNote: 'Minimum order: 5 Kg' },
    ],
  },
  {
    name: 'Cassava Flour',
    category: 'Grains',
    description: 'Finely ground cassava flour, gluten-free alternative for baking and cooking',
    unitSlug: 'kg',
    listings: [
      { province: 'Western Province', district: 'Nyamasheke', title: 'Cassava Flour — Nyamasheke', description: 'Traditionally processed cassava flour. Gluten-free, perfect for baking, Mix, and porridge.', price: 800, quantity: 5000, qualityGrade: 'Grade A', deliveryNote: 'Available in 1Kg, 5Kg, and 25Kg packages' },
      { province: 'Southern Province', district: 'Kamonyi', title: 'Premium Cassava Flour', description: 'Fine cassava flour from Kamonyi. Great for Mix, baking, and traditional dishes.', price: 750, quantity: 4000 },
    ],
  },
  {
    name: 'Cooking Bananas',
    category: 'Fruits',
    description: 'Green cooking bananas (Gros Michel variety, locally known as Igikombe)',
    unitSlug: 'basket',
    listings: [
      { province: 'Western Province', district: 'Rutsiro', title: 'Green Cooking Bananas', description: 'Freshly harvested cooking bananas from Rutsiro. Perfect for daily cooking, boiling, and roasting.', price: 5000, quantity: 200, deliveryNote: 'Each basket approximately 30 Kg' },
      { province: 'Southern Province', district: 'Gisagara', title: 'Cooking Bananas — Gisagara', description: 'High-quality green bananas for boiling and roasting. Fresh from the farm.', price: 4500, quantity: 150 },
    ],
  },
  {
    name: 'Broilers (Chicken)',
    category: 'Other',
    description: 'Live broiler chickens, ready for sale',
    unitSlug: 'piece',
    listings: [
      { province: 'Kigali City', district: 'Gasabo', title: 'Broiler Chickens — Gasabo', description: 'Healthy broiler chickens raised on local farms. Vaccinated, healthy, and ready for market. Average weight 1.5-2 Kg.', price: 12000, quantity: 100, qualityGrade: 'Premium', deliveryNote: 'Minimum order: 10 chickens. Free delivery in Kigali.' },
      { province: 'Eastern Province', district: 'Rwamagana', title: 'Farm-Raised Broilers', description: 'Quality broiler chickens from Rwamagana. Vaccinated and healthy. Average weight 1.8 Kg.', price: 11000, quantity: 80, deliveryNote: 'Available for pickup or delivery within Rwamagana' },
    ],
  },
  {
    name: 'Eggs',
    category: 'Other',
    description: 'Fresh farm eggs, clean and graded',
    unitSlug: 'piece',
    listings: [
      { province: 'Kigali City', district: 'Gasabo', title: 'Fresh Farm Eggs', description: 'Daily collection of fresh eggs from Gasabo poultry farms. Graded, clean, and packed in trays of 30.', price: 250, quantity: 5000, qualityGrade: 'Grade A', deliveryNote: 'Free delivery in Kigali for 10 trays+' },
      { province: 'Northern Province', district: 'Rulindo', title: 'Free-Range Eggs', description: 'Nutritious free-range eggs from Rulindo. Rich flavor and deep yellow yolk from naturally fed chickens.', price: 300, quantity: 3000, qualityGrade: 'Premium', deliveryNote: 'Delivered twice weekly to Kigali' },
    ],
  },
]

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

async function run() {
  const provinces = Provinces()
  console.log('Using rwanda package — Provinces:', provinces.join(', '))

  await AppDataSource.initialize()
  const locationRepo = AppDataSource.getRepository(Location)
  const categoryRepo = AppDataSource.getRepository(Category)
  const productRepo = AppDataSource.getRepository(Product)
  const unitRepo = AppDataSource.getRepository(Unit)
  const listingRepo = AppDataSource.getRepository(Listing)
  const userRepo = AppDataSource.getRepository(User)

  let seller = await userRepo.findOne({ where: { email: 'seller@ihahiro.rw' } })
  if (!seller) {
    const passwordHash = await bcrypt.hash('seller123', 12)
    seller = userRepo.create({
      email: 'seller@ihahiro.rw',
      passwordHash,
      firstName: 'Demo',
      lastName: 'Seller',
      phone: '+250788000001',
      whatsapp: '+250788000001',
      isBuyer: false,
      isSeller: true,
      role: UserRole.USER,
      isVerified: true,
      isActive: true,
    })
    await userRepo.save(seller)
    console.log('Created demo seller: seller@ihahiro.rw / seller123')
  }

  const categories = await categoryRepo.find()
  const units = await unitRepo.find()
  const categoryByName = new Map(categories.map((c) => [normalize(c.name), c]))
  const unitBySlug = new Map(units.map((u) => [normalize(u.slug), u]))

  const allDistricts = await locationRepo.find({
    where: { type: LocationType.DISTRICT },
    relations: { parent: true },
  })

  const provinceDistrictsLower = new Map<string, Map<string, Location>>()
  for (const [provinceName, districtNames] of Object.entries(RWANDA_PROVINCES_WITH_DISTRICTS)) {
    const districtMap = new Map<string, Location>()
    for (const dName of districtNames) {
      const match = allDistricts.find(
        (d) => normalize(d.name) === normalize(dName) && d.parent && normalize(d.parent.name) === normalize(provinceName)
      )
      if (match) districtMap.set(normalize(dName), match)
    }
    provinceDistrictsLower.set(normalize(provinceName), districtMap)
  }

  let productCount = 0
  let listingCount = 0

  for (const def of PRODUCT_DEFS) {
    const category = categoryByName.get(normalize(def.category))
    if (!category) {
      console.warn(`Category "${def.category}" not found — skipping "${def.name}"`)
      continue
    }

    const unit = unitBySlug.get(normalize(def.unitSlug))
    if (!unit) {
      console.warn(`Unit "${def.unitSlug}" not found — skipping "${def.name}"`)
      continue
    }

    let product = await productRepo.findOne({ where: { name: def.name } })
    if (!product) {
      product = productRepo.create({
        name: def.name,
        description: def.description,
        categoryId: category.id,
        unitId: unit.id,
        isActive: true,
      })
      await productRepo.save(product)
      console.log(`Created product: ${def.name}`)
      productCount++
    }

    for (const listingDef of def.listings) {
      const districtMap = provinceDistrictsLower.get(normalize(listingDef.province))
      if (!districtMap) {
        console.warn(`Province "${listingDef.province}" not found — skipping listing for ${listingDef.district}`)
        continue
      }

      const location = districtMap.get(normalize(listingDef.district))
      if (!location) {
        console.warn(`District "${listingDef.district}" in "${listingDef.province}" not found — skipping listing`)
        continue
      }

      const existing = await listingRepo.findOne({
        where: { productId: product.id, locationId: location.id, sellerId: seller.id },
      })
      if (existing) {
        console.log(`  Listing already exists for "${def.name}" in ${listingDef.district}`)
        continue
      }

      await listingRepo.save(
        listingRepo.create({
          sellerId: seller.id,
          productId: product.id,
          unitId: unit.id,
          locationId: location.id,
          title: listingDef.title,
          description: listingDef.description,
          price: listingDef.price,
          quantity: listingDef.quantity,
          status: ListingStatus.PUBLISHED,
          contactPhone: listingDef.contactPhone ?? seller.phone,
          contactWhatsapp: listingDef.contactWhatsapp ?? seller.whatsapp,
          qualityGrade: listingDef.qualityGrade ?? null,
          deliveryNote: listingDef.deliveryNote ?? null,
          publishedAt: new Date(),
        })
      )
      console.log(`  Created listing: "${listingDef.title}"`)
      listingCount++
    }
  }

  console.log(`\nSeed complete! ${productCount} new products, ${listingCount} new listings across Rwanda.`)
  await AppDataSource.destroy()
}

run().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
