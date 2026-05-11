import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { Ticket } from '../../tickets/entities/ticket.entity'
import { Truck } from '../../trucks/entities/truck.entity'

@Entity('sites')
export class Site {
  @ApiProperty()
  @PrimaryColumn()
  id: number

  @ApiProperty()
  @Column()
  name: string

  @ApiProperty()
  @Column()
  address: string

  @ApiProperty()
  @Column({ type: 'text' })
  description: string

  @OneToMany(() => Truck, (truck) => truck.site)
  trucks: Truck[]

  @OneToMany(() => Ticket, (ticket) => ticket.site)
  tickets: Ticket[]
}
