import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { TicketsService } from './tickets.service'

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}
}
