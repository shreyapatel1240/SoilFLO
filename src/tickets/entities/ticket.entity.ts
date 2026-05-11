import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { Site } from '../../sites/entities/site.entity'
import { Truck } from '../../trucks/entities/truck.entity'

@Entity('tickets')
@Unique('UQ_tickets_truck_dispatched', ['truckId', 'dispatchedAt'])
@Unique('UQ_tickets_site_number', ['siteId', 'ticketNumber'])
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'truck_id' })
  truckId: number

  @ManyToOne(() => Truck, (truck) => truck.tickets, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'truck_id' })
  truck: Truck

  @Column({ name: 'site_id' })
  siteId: number

  @ManyToOne(() => Site, (site) => site.tickets, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'site_id' })
  site: Site

  @Column({ name: 'ticket_number' })
  ticketNumber: number

  @Column({ default: 'Soil' })
  material: string

  @Column({ name: 'dispatched_at', type: 'timestamptz' })
  dispatchedAt: Date
}
