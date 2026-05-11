import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTrucksTable1778463683716 implements MigrationInterface {
  name = 'CreateTrucksTable1778463683716'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "trucks" (
        "id"      INTEGER           NOT NULL,
        "license" CHARACTER VARYING NOT NULL,
        "site_id" INTEGER           NOT NULL,
        CONSTRAINT "PK_trucks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_trucks_sites" FOREIGN KEY ("site_id")
          REFERENCES "sites"("id") ON DELETE RESTRICT
      )
    `)
    await queryRunner.query(`CREATE INDEX "IDX_trucks_site_id" ON "trucks" ("site_id")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_trucks_site_id"`)
    await queryRunner.query(`DROP TABLE "trucks"`)
  }
}
