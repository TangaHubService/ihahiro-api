import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as bcrypt from 'bcrypt'
import { Provinces, Districts, Sectors, Cells, Villages } from 'rwanda'
import { AppDataSource } from '../data-source'
import { Location, LocationType } from '@/modules/locations/entities/location.entity'
import { Category } from '@/modules/categories/entities/category.entity'
import { Product } from '@/modules/products/entities/product.entity'
import { Unit } from '@/modules/units/entities/unit.entity'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { User } from '@/modules/users/entities/user.entity'
import { ListingStatus } from '@/modules/listings/entities/listing-status.enum'
import { UserRole } from '@/common/enums/user-role.enum'

dotenv.config()

const PROVINCE_DISPLAY: Record<string, string> = {
  East: 'Eastern Province',
  Kigali: 'Kigali City',
  North: 'Northern Province',
  South: 'Southern Province',
  West: 'Western Province',
}

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
    qualityGrade?: string
    deliveryNote?: string
  }>
}> = [
  {
    name: 'Irish Potatoes', category: 'Tubers', description: 'Fresh Irish potatoes, high-quality variety suitable for chips and boiling', unitSlug: 'kg',
    listings: [
      { province: 'Northern Province', district: 'Musanze', title: 'Fresh Irish Potatoes from Musanze', description: 'High-quality Irish potatoes harvested this season from the volcanic soils of Musanze. Clean, sorted, and ready for market.', price: 800, quantity: 5000, qualityGrade: 'Grade A', deliveryNote: 'Available for bulk delivery within 24 hours' },
      { province: 'Southern Province', district: 'Nyamagabe', title: 'Premium Irish Potatoes', description: 'Clean, sorted Irish potatoes from Nyamagabe farms. Ideal for hotels, restaurants, and resellers.', price: 750, quantity: 3000, qualityGrade: 'Grade A', deliveryNote: 'Free delivery for orders above 500 Kg' },
    ],
  },
  {
    name: 'Maize Flour', category: 'Grains', description: 'Finely milled maize flour, perfect for ugali and porridge', unitSlug: 'kg',
    listings: [
      { province: 'Eastern Province', district: 'Nyagatare', title: 'Pure Maize Flour — Nyagatare Mill', description: 'Locally milled maize flour from Nyagatare. No additives, naturally gluten-free. Available in 1Kg, 5Kg, and 25Kg bags.', price: 1200, quantity: 10000, qualityGrade: 'Premium', deliveryNote: 'Bulk orders of 100Kg+ receive 5% discount' },
      { province: 'Southern Province', district: 'Ruhango', title: 'Premium Maize Flour', description: 'Fine maize flour from Ruhango region. Perfect for breakfast porridge and ugali. Milled fresh weekly.', price: 1100, quantity: 8000, deliveryNote: 'Delivered within 48 hours anywhere in the Southern Province' },
    ],
  },
  {
    name: 'Sorghum', category: 'Grains', description: 'Red and white sorghum grains, cleaned and sorted', unitSlug: 'kg',
    listings: [
      { province: 'Eastern Province', district: 'Kayonza', title: 'Organic Sorghum Grains', description: 'Premium sorghum grains from Kayonza. Ideal for brewing and porridge. Available in 10Kg, 50Kg, and 100Kg bags.', price: 900, quantity: 6000, qualityGrade: 'Grade A', deliveryNote: 'Call for same-day delivery within Kayonza' },
    ],
  },
  {
    name: 'Groundnuts', category: 'Legumes', description: 'Raw shelled groundnuts, sun-dried and sorted', unitSlug: 'kg',
    listings: [
      { province: 'Eastern Province', district: 'Gatsibo', title: 'Sun-Dried Groundnuts', description: 'High-protein groundnuts dried naturally in the sun. Perfect for snacks and peanut butter processing.', price: 1500, quantity: 4000, qualityGrade: 'Premium', deliveryNote: 'Wholesale price available for 100Kg+ orders' },
      { province: 'Southern Province', district: 'Nyanza', title: 'Fresh Groundnuts', description: 'Large-size groundnuts from Nyanza. Great for roasting and cooking. Fresh from this season\'s harvest.', price: 1400, quantity: 3500, qualityGrade: 'Grade A' },
    ],
  },
  {
    name: 'Pineapples', category: 'Fruits', description: 'Sweet, ripe pineapples ready for consumption', unitSlug: 'piece',
    listings: [
      { province: 'Eastern Province', district: 'Bugesera', title: 'Sweet Bugesera Pineapples', description: 'Juicy, sweet pineapples from Bugesera. Naturally ripened in the sun. Perfect for fresh juice and fruit salads.', price: 2000, quantity: 2000, qualityGrade: 'Premium', deliveryNote: 'Minimum order: 50 pieces' },
      { province: 'Southern Province', district: 'Huye', title: 'Fresh Farm Pineapples', description: 'Locally grown pineapples from Huye. Naturally sweet with no added sugars.', price: 1800, quantity: 1500, deliveryNote: 'Delivered fresh within 24 hours of harvest' },
    ],
  },
  {
    name: 'Mangoes', category: 'Fruits', description: 'Ripe mangoes, various local varieties including Dodo and Apple mango', unitSlug: 'piece',
    listings: [
      { province: 'Eastern Province', district: 'Rwamagana', title: 'Ripe Mangoes — Rwamagana Valley', description: 'Delicious locally grown mangoes. Available in Dodo and Apple varieties. Naturally ripened and sorted by size.', price: 500, quantity: 5000, qualityGrade: 'Grade A', deliveryNote: 'Free delivery within Rwamagana district' },
    ],
  },
  {
    name: 'Tomatoes', category: 'Vegetables', description: 'Fresh, vine-ripened tomatoes', unitSlug: 'kg',
    listings: [
      { province: 'Kigali City', district: 'Gasabo', title: 'Fresh Tomatoes — Gasabo Farm', description: 'Vine-ripened tomatoes grown in Gasabo greenhouses. Delivered daily to Kigali markets.', price: 600, quantity: 2000, qualityGrade: 'Grade A', deliveryNote: 'Same-day delivery in Kigali for orders above 50 Kg' },
      { province: 'Northern Province', district: 'Burera', title: 'Fresh Tomatoes from Burera', description: 'Locally grown fresh tomatoes from Burera. Rich flavor, ideal for cooking and fresh consumption.', price: 550, quantity: 1500 },
    ],
  },
  {
    name: 'Passion Fruit', category: 'Fruits', description: 'Fresh purple and yellow passion fruits', unitSlug: 'piece',
    listings: [
      { province: 'Western Province', district: 'Rubavu', title: 'Organic Passion Fruit', description: 'Aromatic passion fruits from the Rubavu region. Rich in vitamin C, perfect for fresh juice and desserts.', price: 300, quantity: 8000, qualityGrade: 'Premium', deliveryNote: 'Bulk orders packed in crates of 100 pieces' },
      { province: 'Kigali City', district: 'Kicukiro', title: 'Fresh Passion Fruits', description: 'Farm-fresh passion fruits available in Kicukiro. Sweet and aromatic, ideal for juice making.', price: 350, quantity: 5000 },
    ],
  },
  {
    name: 'Peas', category: 'Legumes', description: 'Dried peas, sorted and cleaned', unitSlug: 'kg',
    listings: [
      { province: 'Northern Province', district: 'Gicumbi', title: 'Dried Peas — Gicumbi Highlands', description: 'Premium dried peas from the Gicumbi highlands. High protein content, long shelf life. Available in 10Kg and 50Kg bags.', price: 1300, quantity: 4000, qualityGrade: 'Grade A' },
    ],
  },
  {
    name: 'Soybeans', category: 'Legumes', description: 'Non-GMO soybeans for cooking and processing', unitSlug: 'kg',
    listings: [
      { province: 'Western Province', district: 'Rusizi', title: 'Quality Soybeans', description: 'Locally grown non-GMO soybeans from Rusizi. Ideal for soy milk, tofu, and flour production.', price: 1000, quantity: 6000, qualityGrade: 'Premium', deliveryNote: 'Wholesale pricing available for 500Kg+' },
    ],
  },
  {
    name: 'Chili Peppers', category: 'Vegetables', description: 'Fresh hot chili peppers (Akabanga style)', unitSlug: 'kg',
    listings: [
      { province: 'Kigali City', district: 'Nyarugenge', title: 'Fresh Chili Peppers', description: 'Locally grown hot chili peppers. Perfect for seasoning, sauce making, and drying for long-term use.', price: 2500, quantity: 500, qualityGrade: 'Premium', deliveryNote: 'Minimum order: 5 Kg' },
    ],
  },
  {
    name: 'Cassava Flour', category: 'Grains', description: 'Finely ground cassava flour, gluten-free alternative for baking and cooking', unitSlug: 'kg',
    listings: [
      { province: 'Western Province', district: 'Nyamasheke', title: 'Cassava Flour — Nyamasheke', description: 'Traditionally processed cassava flour. Gluten-free, perfect for baking, Mix, and porridge.', price: 800, quantity: 5000, qualityGrade: 'Grade A', deliveryNote: 'Available in 1Kg, 5Kg, and 25Kg packages' },
      { province: 'Southern Province', district: 'Kamonyi', title: 'Premium Cassava Flour', description: 'Fine cassava flour from Kamonyi. Great for Mix, baking, and traditional dishes.', price: 750, quantity: 4000 },
    ],
  },
  {
    name: 'Cooking Bananas', category: 'Fruits', description: 'Green cooking bananas (Gros Michel variety, locally known as Igikombe)', unitSlug: 'basket',
    listings: [
      { province: 'Western Province', district: 'Rutsiro', title: 'Green Cooking Bananas', description: 'Freshly harvested cooking bananas from Rutsiro. Perfect for daily cooking, boiling, and roasting.', price: 5000, quantity: 200, deliveryNote: 'Each basket approximately 30 Kg' },
      { province: 'Southern Province', district: 'Gisagara', title: 'Cooking Bananas — Gisagara', description: 'High-quality green bananas for boiling and roasting. Fresh from the farm.', price: 4500, quantity: 150 },
    ],
  },
  {
    name: 'Broilers (Chicken)', category: 'Other', description: 'Live broiler chickens, ready for sale', unitSlug: 'piece',
    listings: [
      { province: 'Kigali City', district: 'Gasabo', title: 'Broiler Chickens — Gasabo', description: 'Healthy broiler chickens raised on local farms. Vaccinated, healthy, and ready for market. Average weight 1.5-2 Kg.', price: 12000, quantity: 100, qualityGrade: 'Premium', deliveryNote: 'Minimum order: 10 chickens. Free delivery in Kigali.' },
      { province: 'Eastern Province', district: 'Rwamagana', title: 'Farm-Raised Broilers', description: 'Quality broiler chickens from Rwamagana. Vaccinated and healthy. Average weight 1.8 Kg.', price: 11000, quantity: 80, deliveryNote: 'Available for pickup or delivery within Rwamagana' },
    ],
  },
  {
    name: 'Eggs', category: 'Other', description: 'Fresh farm eggs, clean and graded', unitSlug: 'piece',
    listings: [
      { province: 'Kigali City', district: 'Gasabo', title: 'Fresh Farm Eggs', description: 'Daily collection of fresh eggs from Gasabo poultry farms. Graded, clean, and packed in trays of 30.', price: 250, quantity: 5000, qualityGrade: 'Grade A', deliveryNote: 'Free delivery in Kigali for 10 trays+' },
      { province: 'Northern Province', district: 'Rulindo', title: 'Free-Range Eggs', description: 'Nutritious free-range eggs from Rulindo. Rich flavor and deep yellow yolk from naturally fed chickens.', price: 300, quantity: 3000, qualityGrade: 'Premium', deliveryNote: 'Delivered twice weekly to Kigali' },
    ],
  },
]

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

async function findOrCreateLoc(
  repo: ReturnType<typeof AppDataSource.getRepository<Location>>,
  name: string,
  type: LocationType,
  parent: Location | null,
  existing: Map<string, Location>,
): Promise<Location> {
  const key = `${type}:${normalize(name)}:${parent?.id ?? 'root'}`
  const cached = existing.get(key)
  if (cached) return cached

  const location = repo.create({
    name,
    type,
    parentId: parent?.id ?? null,
    ancestorIds: parent ? [...parent.ancestorIds, parent.id] : [],
  })
  await repo.save(location)
  existing.set(key, location)
  return location
}

async function run() {
  const rp = Provinces()
  const totalSectors = Sectors()?.length ?? 0
  const totalCells = Cells()?.length ?? 0
  const totalVillages = Villages()?.length ?? 0
  console.log('Using rwanda package —', rp.length, 'provinces,',
    Districts({ provinces: rp[0] as any })?.length ?? 0, 'districts,',
    totalSectors, 'sectors,', totalCells, 'cells,', totalVillages, 'villages')

  await AppDataSource.initialize()
  const locRepo = AppDataSource.getRepository(Location)

  const locCache = new Map<string, Location>()

  for (const provinceShort of rp) {
    const provinceName = PROVINCE_DISPLAY[provinceShort]
    const province = await findOrCreateLoc(locRepo, provinceName, LocationType.PROVINCE, null, locCache)

    const districtNames = Districts({ provinces: provinceShort as any })
    if (!districtNames) continue

    for (const districtName of districtNames) {
      const district = await findOrCreateLoc(locRepo, districtName, LocationType.DISTRICT, province, locCache)

      const allSectorsInProv = Sectors({ province: provinceShort as any, district: districtName as any })
      if (!allSectorsInProv) continue

      for (const sectorName of allSectorsInProv) {
        const cellNames = Cells({ province: provinceShort as any, district: districtName as any, sector: sectorName })
        if (!cellNames || cellNames.length === 0) continue

        const sector = await findOrCreateLoc(locRepo, sectorName, LocationType.SECTOR, district, locCache)

        for (const cellName of cellNames) {
          const cell = await findOrCreateLoc(locRepo, cellName, LocationType.CELL, sector, locCache)

          const villageNames = Villages({ province: provinceShort as any, district: districtName as any, sector: sectorName as any, cell: cellName as any })
          if (!villageNames) continue

          for (const villageName of villageNames) {
            await findOrCreateLoc(locRepo, villageName, LocationType.VILLAGE, cell, locCache)
          }
        }
      }
    }
  }

  console.log('Location seeding complete.')

  const catRepo = AppDataSource.getRepository(Category)
  const unitRepo = AppDataSource.getRepository(Unit)
  const prodRepo = AppDataSource.getRepository(Product)
  const listingRepo = AppDataSource.getRepository(Listing)
  const userRepo = AppDataSource.getRepository(User)

  const CATEGORIES = ['Grains', 'Legumes', 'Vegetables', 'Fruits', 'Tubers', 'Other']
  const UNITS: Array<{ name: string; slug: string; shortName: string }> = [
    { name: 'Kilogram', slug: 'kg', shortName: 'Kg' },
    { name: 'Bag', slug: 'bag', shortName: 'Bag' },
    { name: 'Basket', slug: 'basket', shortName: 'Basket' },
    { name: 'Litre', slug: 'litre', shortName: 'L' },
    { name: 'Piece', slug: 'piece', shortName: 'Pc' },
  ]
  const CATALOG_PRODUCTS: Array<{ name: string; category: string }> = [
    { name: 'Potatoes', category: 'Tubers' },
    { name: 'Sweet Potatoes', category: 'Tubers' },
    { name: 'Cassava', category: 'Tubers' },
    { name: 'Carrots', category: 'Vegetables' },
    { name: 'Onions', category: 'Vegetables' },
    { name: 'Cabbage', category: 'Vegetables' },
    { name: 'Beans', category: 'Legumes' },
    { name: 'Maize', category: 'Grains' },
    { name: 'Rice', category: 'Grains' },
    { name: 'Bananas', category: 'Fruits' },
    { name: 'Avocado', category: 'Fruits' },
  ]

  const categoryByName = new Map<string, Category>()
  for (const name of CATEGORIES) {
    let cat = await catRepo.findOne({ where: { name } })
    if (!cat) {
      cat = await catRepo.save(catRepo.create({ name, isActive: true }))
      console.log(`Created category: ${name}`)
    }
    categoryByName.set(name, cat)
  }

  let kgUnit: Unit | null = null
  for (const def of UNITS) {
    let unit = await unitRepo.findOne({ where: { slug: def.slug } })
    if (!unit) {
      unit = await unitRepo.save(unitRepo.create(def))
      console.log(`Created unit: ${def.name}`)
    }
    if (def.slug === 'kg') kgUnit = unit
  }

  for (const pd of CATALOG_PRODUCTS) {
    const cat = categoryByName.get(pd.category)
    if (!cat) continue
    const existing = await prodRepo.findOne({ where: { name: pd.name } })
    if (!existing) {
      await prodRepo.save(prodRepo.create({
        name: pd.name,
        categoryId: cat.id,
        unitId: kgUnit?.id ?? null,
        isActive: true,
      }))
      console.log(`Created product: ${pd.name}`)
    }
  }

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

  const unitBySlug = new Map<string, Unit>()
  for (const u of UNITS) {
    const unit = await unitRepo.findOne({ where: { slug: u.slug } })
    if (unit) unitBySlug.set(normalize(u.slug), unit)
  }

  const allDistricts = await locRepo.find({ where: { type: LocationType.DISTRICT }, relations: { parent: true } })
  const districtByProvinceAndName = new Map<string, Location>()
  for (const d of allDistricts) {
    if (d.parent) {
      districtByProvinceAndName.set(`${normalize(d.parent.name)}:${normalize(d.name)}`, d)
    }
  }

  let productCount = 0
  let listingCount = 0

  for (const def of PRODUCT_DEFS) {
    const category = categoryByName.get(normalize(def.category))
    if (!category) { console.warn(`Category "${def.category}" not found`); continue }
    const unit = unitBySlug.get(normalize(def.unitSlug))
    if (!unit) { console.warn(`Unit "${def.unitSlug}" not found`); continue }

    let product = await prodRepo.findOne({ where: { name: def.name } })
    if (!product) {
      product = prodRepo.create({ name: def.name, description: def.description, categoryId: category.id, unitId: unit.id, isActive: true })
      await prodRepo.save(product)
      console.log(`Created product: ${def.name}`)
      productCount++
    }

    for (const ld of def.listings) {
      const location = districtByProvinceAndName.get(`${normalize(ld.province)}:${normalize(ld.district)}`)
      if (!location) { console.warn(`Location not found: ${ld.district}, ${ld.province}`); continue }

      const existing = await listingRepo.findOne({ where: { productId: product.id, locationId: location.id, sellerId: seller.id } })
      if (existing) continue

      await listingRepo.save(listingRepo.create({
        sellerId: seller.id, productId: product.id, unitId: unit.id, locationId: location.id,
        title: ld.title, description: ld.description, price: ld.price, quantity: ld.quantity,
        status: ListingStatus.PUBLISHED, contactPhone: seller.phone, contactWhatsapp: seller.whatsapp,
        qualityGrade: ld.qualityGrade ?? null, deliveryNote: ld.deliveryNote ?? null, publishedAt: new Date(),
      }))
      console.log(`  Created listing: "${ld.title}"`)
      listingCount++
    }
  }

  console.log(`\nDone! ${productCount} products, ${listingCount} listings.`)
  await AppDataSource.destroy()
}

run().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
