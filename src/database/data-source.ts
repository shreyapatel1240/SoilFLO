import 'reflect-metadata'
import * as dotenv from 'dotenv'
import { DataSource } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { Site } from '../sites/entities/site.entity'
import { Truck } from '../trucks/entities/truck.entity'
import { Ticket } from '../tickets/entities/ticket.entity'
import { SiteTicketCounter } from '../tickets/entities/site-ticket-counter.entity'
import { CreateSitesTable1778463622870 } from './migrations/1778463622870-CreateSitesTable'
import { CreateTrucksTable1778463683716 } from './migrations/1778463683716-CreateTrucksTable'
import { CreateTicketsTable1778463703022 } from './migrations/1778463703022-CreateTicketsTable'
import { CreateSiteTicketCountersTable1778463728281 } from './migrations/1778463728281-CreateSiteTicketCountersTable'

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' })

export const dataSourceOptions: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'soilflo',
  entities: [Site, Truck, Ticket, SiteTicketCounter],
  migrations: [
    CreateSitesTable1778463622870,
    CreateTrucksTable1778463683716,
    CreateTicketsTable1778463703022,
    CreateSiteTicketCountersTable1778463728281,
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
}

export const AppDataSource = new DataSource(dataSourceOptions)
