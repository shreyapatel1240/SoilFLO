import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TrucksModule } from '../trucks/trucks.module'
import { SiteTicketCounter } from './entities/site-ticket-counter.entity'
import { Ticket } from './entities/ticket.entity'
import { TicketsController } from './tickets.controller'
import { TicketsService } from './tickets.service'

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, SiteTicketCounter]), TrucksModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
