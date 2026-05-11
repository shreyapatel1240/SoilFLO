import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { Ticket } from '../entities/ticket.entity'

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
}
