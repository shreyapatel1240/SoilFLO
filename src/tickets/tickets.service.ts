import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateTicketsDto } from './dto/create-tickets.dto'
import { TicketResponseDto } from './dto/ticket-response.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Truck } from 'src/trucks/entities/truck.entity'
import { Repository } from 'typeorm/browser/repository/Repository.js'
import { TicketsRepository } from './repositories/tickets.repository'
import { SiteTicketCounterRepository } from './repositories/site-ticket-counter-repository'
import { Ticket } from './entities/ticket.entity'
import { SiteTicketCounter } from './entities/site-ticket-counter.entity'
import { DataSource, In } from 'typeorm'

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name)

  constructor(
    @InjectRepository(Truck)
    private readonly truckRepo: Repository<Truck>,
    private readonly dataSource: DataSource,
    private readonly ticketsRepository: TicketsRepository,
    private readonly counterRepository: SiteTicketCounterRepository,
  ) {}

  async createBulk(dto: CreateTicketsDto): Promise<TicketResponseDto[]> {
    const truck = await this.truckRepo.findOne({
      where: { id: dto.truckId },
      relations: ['site'],
    });
    if (!truck) {
      throw new NotFoundException(`Truck with ID ${dto.truckId} not found`);
    }

    const now = new Date();
    const dispatchedAts = dto.tickets.map((ticket) => new Date(ticket.dispatchedAt));

    const futureDates = dispatchedAts.filter((dispatchedAt) => dispatchedAt > now);
    if (futureDates.length > 0) {
      throw new BadRequestException(
        `Tickets cannot be dispatched at a future date: ${futureDates
          .map((dispatchedAt) => dispatchedAt.toISOString())
          .join(', ')}`,
      );
    }

    const uniqueTimes = new Set(dispatchedAts.map((dispatchedAt) => dispatchedAt.toISOString()));
    if (uniqueTimes.size !== dispatchedAts.length) {
      throw new BadRequestException(
        'Two tickets cannot have the same dispatched time for the same truck',
      );
    }

    return this.dataSource.transaction(async (entityManager) => {
      const existing = await this.ticketsRepository.findExistingByTruckAndTimes(
        truck.id,
        dispatchedAts,
        entityManager,
      );

      if (existing.length > 0) {
        throw new BadRequestException(
          `Duplicate dispatched times already exist for truck ${truck.id}: ${existing
            .map((ticket) => ticket.dispatchedAt.toISOString())
            .join(', ')}`,
        );
      }

      const counter = await this.counterRepository.lockBySiteId(truck.siteId, entityManager);

      if (!counter) {
        throw new NotFoundException(
          `Ticket counter not found for site ${truck.siteId}. Ensure the seed script has been run.`,
        );
      }

      let nextNumber = counter.lastTicketNumber;
      const ticketEntities = dispatchedAts.map((dispatchedAt) => {
        nextNumber++;
        return entityManager.getRepository(Ticket).create({
          truckId: truck.id,
          siteId: truck.siteId,
          ticketNumber: nextNumber,
          material: 'Soil',
          dispatchedAt,
        });
      });

      const saved = await entityManager.getRepository(Ticket).save(ticketEntities);

      await entityManager
        .getRepository(SiteTicketCounter)
        .update({ siteId: truck.siteId }, { lastTicketNumber: nextNumber });

      this.logger.log(
        `Created ${saved.length} ticket(s) for truck ${truck.id} (site ${truck.siteId})`,
      );

      const withRelations = await entityManager.getRepository(Ticket).find({
        where: { id: In(saved.map((ticket) => ticket.id)) },
        relations: ['site', 'truck'],
      });

      return withRelations.map(TicketResponseDto.fromEntity);
    });
  }
}
