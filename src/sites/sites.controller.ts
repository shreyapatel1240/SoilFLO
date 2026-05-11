import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SitesService } from './sites.service'

@ApiTags('Sites')
@Controller('sites')
export class SitesController {
  constructor(private readonly _sitesService: SitesService) {}

  //   TODO: Implement endpoints for managing sites (CRUD operations)
}
