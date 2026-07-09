import 'reflect-metadata'
import * as dotenv from 'dotenv'
import { AppDataSource } from '../data-source'

dotenv.config()

const TABLES = [
  'listing_media',
  'listings',
  'reports',
  'favorites',
  'reviews',
  'chat_messages',
  'chat_threads',
  'products',
  'notifications',
  'saved_searches',
  'locations',
  'units',
  'categories',
  'refresh_tokens',
  'users',
]

async function run() {
  await AppDataSource.initialize()
  const queryRunner = AppDataSource.createQueryRunner()

  try {
    await queryRunner.startTransaction()

    for (const table of TABLES) {
      await queryRunner.query(`TRUNCATE TABLE "${table}" CASCADE`)
      console.log(`Truncated: ${table}`)
    }

    await queryRunner.commitTransaction()
    console.log('\nAll seed data cleared.')
  } catch (error) {
    await queryRunner.rollbackTransaction()
    console.error('Failed to clear seed data:', error)
    process.exit(1)
  } finally {
    await queryRunner.release()
    await AppDataSource.destroy()
  }
}

run()
