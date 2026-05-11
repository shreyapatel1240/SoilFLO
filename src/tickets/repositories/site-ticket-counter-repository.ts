import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { SiteTicketCounter } from '../entities/site-ticket-counter.entity'

@Injectable()
export class SiteTicketCounterRepository {
  constructor(
    @InjectRepository(SiteTicketCounter)
    private readonly repository: Repository<SiteTicketCounter>,
  ) {}

  lockBySiteId(siteId: number, entityManager: EntityManager): Promise<SiteTicketCounter | null> {
    void this.repository
    return entityManager
      .getRepository(SiteTicketCounter)
      .createQueryBuilder('counter')
      .where('counter.siteId = :siteId', { siteId })
      .setLock('pessimistic_write')
      .getOne()
  }
}
