import { Module } from '@nestjs/common'
import { TicketsModule } from './tickets/tickets.module'
import { TrucksModule } from './trucks/trucks.module'
import { SitesModule } from './sites/sites.module'
import { ConfigModule } from '@nestjs/config/dist/config.module'
import { DatabaseModule } from './database/database.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    SitesModule,
    TrucksModule,
    TicketsModule,
  ],
})
export class AppModule {}
