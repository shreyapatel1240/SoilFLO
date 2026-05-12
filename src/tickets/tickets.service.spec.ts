import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Truck } from '../trucks/entities/truck.entity';
import { SiteTicketCounter } from './entities/site-ticket-counter.entity';
import { Ticket } from './entities/ticket.entity';
import { MaterialType } from './enums/material-type.enum';
import { SiteTicketCounterRepository } from './repositories/site-ticket-counter-repository';
import { TicketsRepository } from './repositories/tickets.repository';
import { TicketsService } from './tickets.service';

const mockTruck: Partial<Truck> = {
  id: 1,
  license: 'TEST-001',
  siteId: 1,
  site: { id: 1, name: 'Test Site' } as any,
};

const mockCounter: Partial<SiteTicketCounter> = {
  siteId: 1,
  lastTicketNumber: 5,
};

function makeTicketsWithRelations(count: number, startNumber: number): Ticket[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    ticketNumber: startNumber + i,
    material: MaterialType.Soil,
    dispatchedAt: new Date('2024-01-01T09:00:00Z'),
    site: { name: 'Test Site' },
    truck: { license: 'TEST-001' },
  })) as unknown as Ticket[];
}

describe('TicketsService', () => {
  let service: TicketsService;

  const mockTruckRepo = { findOne: jest.fn() };
  const mockTicketsRepository = {
    findWithFilters: jest.fn(),
    findById: jest.fn(),
    findExistingByTruckAndTimes: jest.fn().mockResolvedValue([]),
  };
  const mockCounterRepository = {
    lockBySiteId: jest.fn().mockResolvedValue(mockCounter),
  };
  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue({
      create: jest.fn().mockImplementation((d: any) => ({ ...d })),
      save: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
      update: jest.fn().mockResolvedValue({}),
      find: jest.fn().mockResolvedValue([]),
    }),
  };
  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb: any) => cb(mockEntityManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: getRepositoryToken(Truck), useValue: mockTruckRepo },
        { provide: TicketsRepository, useValue: mockTicketsRepository },
        { provide: SiteTicketCounterRepository, useValue: mockCounterRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    jest.clearAllMocks();
  });

  describe('createBulkTickets', () => {
    const pastDate1 = '2024-01-01T09:00:00Z';
    const pastDate2 = '2024-01-01T10:00:00Z';

    it('throws NotFoundException when truck does not exist', async () => {
      mockTruckRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createBulkTickets({ truckId: 999, tickets: [{ dispatchedAt: pastDate1 }] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when any dispatchedAt is in the future', async () => {
      mockTruckRepo.findOne.mockResolvedValue(mockTruck);
      const future = new Date(Date.now() + 3_600_000).toISOString();

      await expect(
        service.createBulkTickets({ truckId: 1, tickets: [{ dispatchedAt: future }] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when duplicate dispatchedAt within request', async () => {
      mockTruckRepo.findOne.mockResolvedValue(mockTruck);

      await expect(
        service.createBulkTickets({
          truckId: 1,
          tickets: [{ dispatchedAt: pastDate1 }, { dispatchedAt: pastDate1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when dispatchedAt already exists in DB for truck', async () => {
      mockTruckRepo.findOne.mockResolvedValue(mockTruck);
      mockTicketsRepository.findExistingByTruckAndTimes.mockResolvedValue([
        { dispatchedAt: new Date(pastDate1) } as Ticket,
      ]);

      await expect(
        service.createBulkTickets({ truckId: 1, tickets: [{ dispatchedAt: pastDate1 }] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('assigns sequential ticket numbers starting from counter.lastTicketNumber + 1', async () => {
      mockTruckRepo.findOne.mockResolvedValue(mockTruck);
      mockTicketsRepository.findExistingByTruckAndTimes.mockResolvedValue([]);
      mockCounterRepository.lockBySiteId.mockResolvedValue(mockCounter);

      let capturedTickets: any[] = [];
      mockEntityManager.getRepository.mockReturnValue({
        create: jest.fn().mockImplementation((d: any) => ({ ...d })),
        save: jest.fn().mockImplementation((tickets: any[]) => {
          capturedTickets = tickets;
          return Promise.resolve(tickets.map((t, i) => ({ ...t, id: i + 1 })));
        }),
        update: jest.fn().mockResolvedValue({}),
        find: jest.fn().mockImplementation(() =>
          Promise.resolve(makeTicketsWithRelations(capturedTickets.length, 6)),
        ),
      });

      await service.createBulkTickets({
        truckId: 1,
        tickets: [{ dispatchedAt: pastDate1 }, { dispatchedAt: pastDate2 }],
      });

      expect(capturedTickets[0].ticketNumber).toBe(6);
      expect(capturedTickets[1].ticketNumber).toBe(7);
    });

    it('updates site_ticket_counter by N after bulk insert', async () => {
      mockTruckRepo.findOne.mockResolvedValue(mockTruck);
      mockTicketsRepository.findExistingByTruckAndTimes.mockResolvedValue([]);
      mockCounterRepository.lockBySiteId.mockResolvedValue(mockCounter);

      const mockUpdate = jest.fn().mockResolvedValue({});
      mockEntityManager.getRepository.mockReturnValue({
        create: jest.fn().mockImplementation((d: any) => ({ ...d })),
        save: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
        update: mockUpdate,
        find: jest.fn().mockResolvedValue(makeTicketsWithRelations(2, 6)),
      });

      await service.createBulkTickets({
        truckId: 1,
        tickets: [{ dispatchedAt: pastDate1 }, { dispatchedAt: pastDate2 }],
      });

      expect(mockUpdate).toHaveBeenCalledWith({ siteId: 1 }, { lastTicketNumber: 7 });
    });
  });

  describe('findAll', () => {
    const mockTicket = {
      id: 1,
      ticketNumber: 1,
      material: MaterialType.Soil,
      dispatchedAt: new Date('2024-01-01T09:00:00Z'),
      site: { name: 'Test Site' },
      truck: { license: 'TEST-001' },
    } as unknown as Ticket;

    it('returns paginated results with correct meta', async () => {
      mockTicketsRepository.findWithFilters.mockResolvedValue([[mockTicket], 1]);

      const result = await service.findAll({ page: 1, limit: 50 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 50, totalPages: 1 });
    });

    it('passes siteIds filter to repository', async () => {
      mockTicketsRepository.findWithFilters.mockResolvedValue([[], 0]);

      await service.findAll({ siteIds: [1, 5], page: 1, limit: 50 });

      expect(mockTicketsRepository.findWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({ siteIds: [1, 5] }),
      );
    });

    it('passes date range filter to repository', async () => {
      mockTicketsRepository.findWithFilters.mockResolvedValue([[], 0]);

      await service.findAll({ startDate: '2024-01-01', endDate: '2024-12-31', page: 1, limit: 50 });

      expect(mockTicketsRepository.findWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({ startDate: '2024-01-01', endDate: '2024-12-31' }),
      );
    });

    it('returns correct TicketResponseDto shape', async () => {
      mockTicketsRepository.findWithFilters.mockResolvedValue([[mockTicket], 1]);

      const result = await service.findAll({ page: 1, limit: 50 });

      expect(result.data[0]).toMatchObject({
        id: 1,
        ticketNumber: 1,
        material: MaterialType.Soil,
        siteName: 'Test Site',
        truckLicense: 'TEST-001',
      });
    });
  });
});
