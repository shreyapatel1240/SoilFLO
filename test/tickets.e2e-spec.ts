import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { MaterialType } from '../src/tickets/enums/material-type.enum';

describe('Tickets (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const TEST_SITE_ID = 999001;
  const TEST_TRUCK_ID = 999001;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());
    await app.init();

    dataSource = app.get<DataSource>(getDataSourceToken());

    await dataSource.query(`
      INSERT INTO sites (id, name, address, description)
      VALUES (${TEST_SITE_ID}, 'E2E Test Site', '1 Test Ave', 'E2E test site')
      ON CONFLICT (id) DO NOTHING
    `);
    await dataSource.query(`
      INSERT INTO trucks (id, license, site_id)
      VALUES (${TEST_TRUCK_ID}, 'E2E-TEST-01', ${TEST_SITE_ID})
      ON CONFLICT (id) DO NOTHING
    `);
    await dataSource.query(`
      INSERT INTO site_ticket_counters (site_id, last_ticket_number)
      VALUES (${TEST_SITE_ID}, 0)
      ON CONFLICT (site_id) DO NOTHING
    `);
  });

  afterEach(async () => {
    await dataSource.query(`DELETE FROM tickets WHERE truck_id = ${TEST_TRUCK_ID}`);
    await dataSource.query(
      `UPDATE site_ticket_counters SET last_ticket_number = 0 WHERE site_id = ${TEST_SITE_ID}`,
    );
  });

  afterAll(async () => {
    await dataSource.query(`DELETE FROM site_ticket_counters WHERE site_id = ${TEST_SITE_ID}`);
    await dataSource.query(`DELETE FROM trucks WHERE id = ${TEST_TRUCK_ID}`);
    await dataSource.query(`DELETE FROM sites WHERE id = ${TEST_SITE_ID}`);
    await app.close();
  });

  describe('POST /api/v1/tickets/bulk-tickets', () => {
    it('201 - creates tickets and returns correct shape', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/tickets/bulk-tickets')
        .send({
          truckId: TEST_TRUCK_ID,
          tickets: [
            { dispatchedAt: '2024-03-15T09:00:00Z' },
            { dispatchedAt: '2024-03-15T10:00:00Z' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toMatchObject({
        material: MaterialType.Soil,
        siteName: 'E2E Test Site',
        truckLicense: 'E2E-TEST-01',
        ticketNumber: 1,
      });
      expect(res.body.data[1].ticketNumber).toBe(2);
    });

    it('400 - rejects when dispatchedAt is in the future', async () => {
      const future = new Date(Date.now() + 3_600_000).toISOString();

      const res = await request(app.getHttpServer())
        .post('/api/v1/tickets/bulk-tickets')
        .send({ truckId: TEST_TRUCK_ID, tickets: [{ dispatchedAt: future }] });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/future/i);
    });

    it('400 - rejects when duplicate dispatchedAt within request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/tickets/bulk-tickets')
        .send({
          truckId: TEST_TRUCK_ID,
          tickets: [
            { dispatchedAt: '2024-03-15T09:00:00Z' },
            { dispatchedAt: '2024-03-15T09:00:00Z' },
          ],
        });

      expect(res.status).toBe(400);
    });

    it('400 - rejects when dispatchedAt already exists in DB for that truck', async () => {
      const dispatchedAt = '2024-03-15T11:00:00Z';

      await request(app.getHttpServer())
        .post('/api/v1/tickets/bulk-tickets')
        .send({ truckId: TEST_TRUCK_ID, tickets: [{ dispatchedAt }] });

      const res = await request(app.getHttpServer())
        .post('/api/v1/tickets/bulk-tickets')
        .send({ truckId: TEST_TRUCK_ID, tickets: [{ dispatchedAt }] });

      expect(res.status).toBe(400);
    });

    it('404 - rejects when truckId does not exist', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/tickets/bulk-tickets')
        .send({ truckId: 999999, tickets: [{ dispatchedAt: '2024-03-15T09:00:00Z' }] });

      expect(res.status).toBe(404);
    });

    it('ticket numbers increment correctly across sequential bulk requests', async () => {
      const res1 = await request(app.getHttpServer())
        .post('/api/v1/tickets/bulk-tickets')
        .send({
          truckId: TEST_TRUCK_ID,
          tickets: [
            { dispatchedAt: '2024-03-15T09:00:00Z' },
            { dispatchedAt: '2024-03-15T10:00:00Z' },
          ],
        });

      const res2 = await request(app.getHttpServer())
        .post('/api/v1/tickets/bulk-tickets')
        .send({
          truckId: TEST_TRUCK_ID,
          tickets: [{ dispatchedAt: '2024-03-15T11:00:00Z' }],
        });

      expect(res1.body.data.map((ticket: any) => ticket.ticketNumber)).toEqual([1, 2]);
      expect(res2.body.data[0].ticketNumber).toBe(3);
    });
  });

  describe('GET /api/v1/tickets', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/tickets/bulk-tickets')
        .send({
          truckId: TEST_TRUCK_ID,
          tickets: [
            { dispatchedAt: '2024-03-15T09:00:00Z' },
            { dispatchedAt: '2024-06-15T09:00:00Z' },
          ],
        });
    });

    it('200 - returns paginated list with meta', async () => {
      const res = await request(app.getHttpServer()).get(
        `/api/v1/tickets?siteIds=${TEST_SITE_ID}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toMatchObject({
        page: 1,
        limit: 50,
      });
      expect(typeof res.body.meta.total).toBe('number');
      expect(typeof res.body.meta.totalPages).toBe('number');
    });

    it('filters by siteIds', async () => {
      const res = await request(app.getHttpServer()).get(
        `/api/v1/tickets?siteIds=${TEST_SITE_ID}`,
      );

      expect(res.status).toBe(200);
      res.body.data.forEach((ticket: any) => {
        expect(ticket.siteName).toBe('E2E Test Site');
      });
    });

    it('filters by startDate and endDate', async () => {
      const res = await request(app.getHttpServer()).get(
        `/api/v1/tickets?siteIds=${TEST_SITE_ID}&startDate=2024-05-01&endDate=2024-07-01`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].dispatchedAt).toContain('2024-06');
    });

    it('returns correct response shape', async () => {
      const res = await request(app.getHttpServer()).get(
        `/api/v1/tickets?siteIds=${TEST_SITE_ID}&limit=1`,
      );

      expect(res.status).toBe(200);
      const ticket = res.body.data[0];
      expect(ticket).toHaveProperty('id');
      expect(ticket).toHaveProperty('ticketNumber');
      expect(ticket).toHaveProperty('material', 'Soil');
      expect(ticket).toHaveProperty('dispatchedAt');
      expect(ticket).toHaveProperty('siteName');
      expect(ticket).toHaveProperty('truckLicense');
    });
  });
});
