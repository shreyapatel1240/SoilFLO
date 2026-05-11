import { ApiProperty } from '@nestjs/swagger'
import { Ticket } from '../entities/ticket.entity'

export class TicketResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  ticketNumber: number

  @ApiProperty()
  material: string

  @ApiProperty()
  dispatchedAt: string

  @ApiProperty()
  siteName: string

  @ApiProperty()
  truckLicense: string

  static fromEntity(ticket: Ticket): TicketResponseDto {
    const dto = new TicketResponseDto()
    dto.id = ticket.id
    dto.ticketNumber = ticket.ticketNumber
    dto.material = ticket.material
    dto.dispatchedAt = ticket.dispatchedAt.toISOString()
    dto.siteName = ticket.site.name
    dto.truckLicense = ticket.truck.license
    return dto
  }
}

export class PaginationMeta {
  @ApiProperty()
  total: number

  @ApiProperty()
  page: number

  @ApiProperty()
  limit: number

  @ApiProperty()
  totalPages: number
}
