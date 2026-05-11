import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { TrucksService } from './trucks.service'

@ApiTags('Trucks')
@Controller('trucks')
export class TrucksController {
  constructor(private readonly _trucksService: TrucksService) {}

  // TODO: Implement endpoints for trucks
}
