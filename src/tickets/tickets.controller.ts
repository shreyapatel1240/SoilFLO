import { Body, Controller, Post } from '@nestjs/common'
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { TicketsService } from './tickets.service'
import { CreateTicketsDto } from './dto/create-tickets.dto'
import { TicketResponseDto } from './dto/ticket-response.dto'

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('bulk tickets')
  @ApiOperation({ summary: 'Create tickets in bulk for a truck' })
  @ApiCreatedResponse({ description: 'Tickets created', type: [TicketResponseDto] })
  @ApiNotFoundResponse({ description: 'Truck not found' })
  async createBulk(@Body() dto: CreateTicketsDto): Promise<{ data: TicketResponseDto[] }> {
    const data = await this.ticketsService.createBulk(dto)
    return { data }
  }
}
