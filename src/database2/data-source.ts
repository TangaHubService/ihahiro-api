import 'reflect-metadata'
import * as dotenv from 'dotenv'
import { DataSource } from 'typeorm'

dotenv.config()

// Used by the TypeORM CLI (migration:generate / migration:run) and by seed scripts.
// The running app itself gets its connection from TypeOrmModule.forRootAsync in app.module.ts —
// keep the two in sync when you change connection settings.
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'ihahiro',
  entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
})
