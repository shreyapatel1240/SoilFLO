import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { Site } from '../../sites/entities/site.entity'
import { Ticket } from '../../tickets/entities/ticket.entity'

@Entity('trucks')
export class Truck {
  @ApiProperty()
  @PrimaryColumn()
  id: number

  @ApiProperty()
  @Column()
  license: string

  @ApiProperty()
  @Column({ name: 'site_id' })
  siteId: number

  @ManyToOne(() => Site, (site) => site.trucks, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'site_id' })
  site: Site

  @OneToMany(() => Ticket, (ticket) => ticket.truck)
  tickets: Ticket[]
}
