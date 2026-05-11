import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsPositive,
  ValidateNested,
} from 'class-validator'

export class CreateTicketItemDto {
  @ApiProperty({
    example: '2024-03-15T09:00:00Z',
    description: 'Dispatch time (must not be in the future)',
  })
  @IsDateString()
  dispatchedAt: string
}

export class CreateTicketsDto {
  @ApiProperty({ example: 1, description: 'ID of the truck dispatching the tickets' })
  @IsInt()
  @IsPositive()
  truckId: number

  @ApiProperty({ type: [CreateTicketItemDto], description: 'List of tickets to create (minimum 1)' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTicketItemDto)
  tickets: CreateTicketItemDto[]
}
