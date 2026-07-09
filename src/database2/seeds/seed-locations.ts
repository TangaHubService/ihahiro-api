import { AppDataSource } from '../data-source'
import { Location, LocationType } from '@/modules/locations/entities/location.entity'
import { RWANDA_PROVINCES_WITH_DISTRICTS } from './rwanda-provinces-districts'

async function run() {
  await AppDataSource.initialize()
  const repo = AppDataSource.getRepository(Location)

  for (const [provinceName, districtNames] of Object.entries(RWANDA_PROVINCES_WITH_DISTRICTS)) {
    let province = await repo.findOne({ where: { name: provinceName, type: LocationType.PROVINCE } })

    if (!province) {
      province = await repo.save(
        repo.create({ name: provinceName, type: LocationType.PROVINCE, parentId: null, ancestorIds: [] })
      )
      console.log(`Created province: ${provinceName}`)
    }

    for (const districtName of districtNames) {
      const existing = await repo.findOne({
        where: { name: districtName, type: LocationType.DISTRICT, parentId: province.id },
      })

      if (!existing) {
        await repo.save(
          repo.create({
            name: districtName,
            type: LocationType.DISTRICT,
            parentId: province.id,
            ancestorIds: [province.id],
          })
        )
        console.log(`  Created district: ${districtName}`)
      }
    }
  }

  console.log('Location seed complete: 5 provinces, 30 districts.')
  console.log('Sectors/cells/villages are not seeded here — run seed:sub-locations with an official NISR CSV export.')
  await AppDataSource.destroy()
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
