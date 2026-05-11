import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Truck } from '../trucks/entities/truck.entity';

interface TruckJson {
  id: number;
  license: string;
  siteId: number;
}

export class TrucksSeeder {
  private readonly logger = console;

  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const filePath = path.join(process.cwd(), 'TrucksJSONData.json');
    const trucks: TruckJson[] = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as TruckJson[];
    const repo = this.dataSource.getRepository(Truck);
    const batchSize = 500;

    for (let i = 0; i < trucks.length; i += batchSize) {
      const batch = trucks.slice(i, i + batchSize).map((truck) => ({
        id: truck.id,
        license: truck.license,
        siteId: truck.siteId,
      }));
      await repo.createQueryBuilder().insert().into(Truck).values(batch).orIgnore().execute();
      this.logger.log(`Trucks: seeded ${Math.min(i + batchSize, trucks.length)}/${trucks.length}`);
    }

    this.logger.log(`Trucks seeding complete (${trucks.length} records)`);
  }
}
