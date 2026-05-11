import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTicketsTable1778463703022 implements MigrationInterface {
  name = 'CreateTicketsTable1778463703022'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tickets" (
        "id"            SERIAL              NOT NULL,
        "truck_id"      INTEGER             NOT NULL,
        "site_id"       INTEGER             NOT NULL,
        "ticket_number" INTEGER             NOT NULL,
        "material"      CHARACTER VARYING   NOT NULL DEFAULT 'Soil',
        "dispatched_at" TIMESTAMPTZ         NOT NULL,
        CONSTRAINT "PK_tickets" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tickets_truck_dispatched" UNIQUE ("truck_id", "dispatched_at"),
        CONSTRAINT "UQ_tickets_site_number" UNIQUE ("site_id", "ticket_number"),
        CONSTRAINT "FK_tickets_trucks" FOREIGN KEY ("truck_id")
          REFERENCES "trucks"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_tickets_sites" FOREIGN KEY ("site_id")
          REFERENCES "sites"("id") ON DELETE RESTRICT
      )
    `)
    await queryRunner.query(`CREATE INDEX "IDX_tickets_site_id" ON "tickets" ("site_id")`)
    await queryRunner.query(`CREATE INDEX "IDX_tickets_dispatched_at" ON "tickets" ("dispatched_at")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_tickets_dispatched_at"`)
    await queryRunner.query(`DROP INDEX "IDX_tickets_site_id"`)
    await queryRunner.query(`DROP TABLE "tickets"`)
  }
}
