import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Site } from '../sites/entities/site.entity';

interface SiteJson {
  id: number;
  name: string;
  address: string;
  description: string;
}

export class SitesSeeder {
  private readonly logger = console;

  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const filePath = path.join(process.cwd(), 'SitesJSONData.json');
    const sites: SiteJson[] = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as SiteJson[];
    const repo = this.dataSource.getRepository(Site);
    const batchSize = 1000;

    for (let i = 0; i < sites.length; i += batchSize) {
      const batch = sites.slice(i, i + batchSize);
      await repo.createQueryBuilder().insert().into(Site).values(batch).orIgnore().execute();
      this.logger.log(`Sites: seeded ${Math.min(i + batchSize, sites.length)}/${sites.length}`);
    }

    this.logger.log(`Sites seeding complete (${sites.length} records)`);
  }
}
