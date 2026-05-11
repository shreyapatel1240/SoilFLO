import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateSitesTable1778463622870 implements MigrationInterface {
  name = 'CreateSitesTable1778463622870'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "sites" (
        "id"          INTEGER               NOT NULL,
        "name"        CHARACTER VARYING     NOT NULL,
        "address"     CHARACTER VARYING     NOT NULL,
        "description" TEXT                  NOT NULL,
        CONSTRAINT "PK_sites" PRIMARY KEY ("id")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sites"`)
  }
}
