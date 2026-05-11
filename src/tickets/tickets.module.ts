import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TrucksModule } from '../trucks/trucks.module'
import { SiteTicketCounter } from './entities/site-ticket-counter.entity'
import { Ticket } from './entities/ticket.entity'
import { TicketsController } from './tickets.controller'
import { TicketsService } from './tickets.service'
import { TicketsRepository } from './repositories/tickets.repository'
import { SiteTicketCounterRepository } from './repositories/site-ticket-counter-repository'

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, SiteTicketCounter]), TrucksModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsRepository, SiteTicketCounterRepository],
})
export class TicketsModule {}
