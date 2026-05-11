import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Site } from '../../sites/entities/site.entity'

@Entity('site_ticket_counters')
export class SiteTicketCounter {
  @PrimaryColumn({ name: 'site_id' })
  siteId: number

  @ManyToOne(() => Site, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'site_id' })
  site: Site

  @Column({ name: 'last_ticket_number', default: 0 })
  lastTicketNumber: number
}
