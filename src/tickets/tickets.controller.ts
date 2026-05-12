import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { TicketsService } from './tickets.service'
import { CreateTicketsDto } from './dto/create-tickets.dto'
import { PaginationMeta, TicketResponseDto } from './dto/ticket-response.dto'
import { GetTicketsQueryDto } from './dto/get-tickets-query.dto'

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('bulk-tickets')
  @ApiOperation({ summary: 'Create tickets in bulk for a truck' })
  @ApiCreatedResponse({ description: 'Tickets created', type: [TicketResponseDto] })
  @ApiNotFoundResponse({ description: 'Truck not found' })
  async createBulkTickets(@Body() dto: CreateTicketsDto): Promise<{ data: TicketResponseDto[] }> {
    const data = await this.ticketsService.createBulkTickets(dto)
    return { data }
  }

  @Get()
  @ApiOperation({ summary: 'List tickets with optional filters and pagination' })
  @ApiOkResponse({ description: 'Paginated ticket list' })
  async findAll(
    @Query() query: GetTicketsQueryDto,
  ): Promise<{ data: TicketResponseDto[]; meta: PaginationMeta }> {
    return this.ticketsService.findAll(query);
  }
}
