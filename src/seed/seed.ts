import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { SitesSeeder } from './sites.seeder';
import { TrucksSeeder } from './trucks.seeder';

async function main(): Promise<void> {
  console.log('Connecting to database...');
  await AppDataSource.initialize();

  console.log('Running migrations...');
  await AppDataSource.runMigrations();

  console.log('Seeding sites...');
  await new SitesSeeder(AppDataSource).run();

  console.log('Seeding trucks...');
  await new TrucksSeeder(AppDataSource).run();

  console.log('Initializing site ticket counters...');
  await AppDataSource.query(`
    INSERT INTO site_ticket_counters (site_id, last_ticket_number)
    SELECT id, 0 FROM sites
    ON CONFLICT (site_id) DO NOTHING
  `);

  console.log('Seeding complete');
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
