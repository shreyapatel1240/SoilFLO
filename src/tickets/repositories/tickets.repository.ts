import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { Ticket } from '../entities/ticket.entity'
import { GetTicketsQueryDto } from '../dto/get-tickets-query.dto'

@Injectable()
export class TicketsRepository {
  constructor(
    @InjectRepository(Ticket)
    private readonly repository: Repository<Ticket>,
  ) {}

  findExistingByTruckAndTimes(
    truckId: number,
    dispatchedAts: Date[],
    entityManager: EntityManager,
  ): Promise<Ticket[]> {
    return entityManager
      .getRepository(Ticket)
      .createQueryBuilder('ticket')
      .where('ticket.truckId = :truckId', { truckId })
      .andWhere('ticket.dispatchedAt IN (:...dispatchedAts)', { dispatchedAts })
      .getMany()
  }

  findWithFilters(query: GetTicketsQueryDto): Promise<[Ticket[], number]> {
    const { siteIds, startDate, endDate, page = 1, limit = 50 } = query;

    const qb = this.repository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.site', 'site')
      .leftJoinAndSelect('ticket.truck', 'truck');

    if (siteIds?.length) {
      qb.andWhere('ticket.siteId = ANY(:siteIds)', { siteIds });
    }
    if (startDate) {
      qb.andWhere('ticket.dispatchedAt >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      qb.andWhere('ticket.dispatchedAt <= :endDate', { endDate: end });
    }

    return qb
      .orderBy('ticket.dispatchedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }
}
