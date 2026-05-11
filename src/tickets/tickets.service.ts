import {
  Injectable,
  Logger,
} from '@nestjs/common'

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor() {}
}
