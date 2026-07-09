/**
 * Imports sectors/cells/villages from a CSV, instead of hard-coding ~17,000 names we can't
 * verify. Get the source file from Rwanda's National Institute of Statistics (NISR) admin
 * boundaries dataset and export/convert it to this shape first:
 *
 *   province,district,sector,cell,village
 *   Kigali City,Gasabo,Bumbogo,Kinyaga,...
 *   ...
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/database/seeds/import-sub-locations.ts path/to/file.csv
 *
 * Safe to re-run: existing rows are matched by (name, type, parentId) and skipped.
 */
import * as fs from 'fs'
import { parse } from 'csv-parse/sync'
import { IsNull } from 'typeorm'
import { AppDataSource } from '../data-source'
import { Location, LocationType } from '@/modules/locations/entities/location.entity'

interface Row {
  province: string
  district: string
  sector: string
  cell: string
  village?: string
}

async function findOrCreate(
  repo: ReturnType<typeof AppDataSource.getRepository<Location>>,
  name: string,
  type: LocationType,
  parent: Location | null
) {
  const existing = await repo.findOne({ where: { name, type, parentId: parent?.id ?? IsNull() } })
  if (existing) return existing

  return repo.save(
    repo.create({
      name,
      type,
      parentId: parent?.id ?? null,
      ancestorIds: parent ? [...parent.ancestorIds, parent.id] : [],
    })
  )
}

async function run() {
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.error('Usage: import-sub-locations.ts <path-to-csv>')
    process.exit(1)
  }

  const raw = fs.readFileSync(csvPath, 'utf-8')
  const rows: Row[] = parse(raw, { columns: true, skip_empty_lines: true, trim: true })

  await AppDataSource.initialize()
  const repo = AppDataSource.getRepository(Location)

  let created = 0
  for (const row of rows) {
    const province = await repo.findOne({ where: { name: row.province, type: LocationType.PROVINCE } })
    if (!province) {
      console.warn(`Skipping row, unknown province "${row.province}"`)
      continue
    }

    const district = await repo.findOne({
      where: { name: row.district, type: LocationType.DISTRICT, parentId: province.id },
    })
    if (!district) {
      console.warn(`Skipping row, unknown district "${row.district}" in ${row.province}`)
      continue
    }

    const sector = await findOrCreate(repo, row.sector, LocationType.SECTOR, district)
    const cell = await findOrCreate(repo, row.cell, LocationType.CELL, sector)
    if (row.village) {
      await findOrCreate(repo, row.village, LocationType.VILLAGE, cell)
    }
    created += 1
  }

  console.log(`Processed ${created} rows.`)
  await AppDataSource.destroy()
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
