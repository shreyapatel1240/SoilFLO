import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Truck } from './entities/truck.entity'

@Injectable()
export class TrucksService {
  constructor(
    @InjectRepository(Truck)
    private readonly _truckRepo: Repository<Truck>,
  ) {}

  // TODO: Implement service methods for trucks
}
