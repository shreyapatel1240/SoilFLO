import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Truck } from './entities/truck.entity'
import { TrucksController } from './trucks.controller'
import { TrucksService } from './trucks.service'

@Module({
  imports: [TypeOrmModule.forFeature([Truck])],
  controllers: [TrucksController],
  providers: [TrucksService],
  exports: [TypeOrmModule, TrucksService],
})
export class TrucksModule {}
