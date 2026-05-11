import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateSiteTicketCountersTable1778463728281 implements MigrationInterface {
  name = 'CreateSiteTicketCountersTable1778463728281'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "site_ticket_counters" (
        "site_id"             INTEGER NOT NULL,
        "last_ticket_number"  INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "PK_site_ticket_counters" PRIMARY KEY ("site_id"),
        CONSTRAINT "FK_site_ticket_counters_sites" FOREIGN KEY ("site_id")
          REFERENCES "sites"("id") ON DELETE RESTRICT
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "site_ticket_counters"`)
  }
}
