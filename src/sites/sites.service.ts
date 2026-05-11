import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Site } from './entities/site.entity'

@Injectable()
export class SitesService {
  private readonly _logger = new Logger(SitesService.name)

  constructor(
    @InjectRepository(Site)
    private readonly _siteRepo: Repository<Site>,
  ) {}

  //   TODO: Implement methods for managing sites (CRUD operations)

}
