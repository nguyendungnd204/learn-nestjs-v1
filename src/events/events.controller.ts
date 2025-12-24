import { Controller, Post } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('create-user')
  createUser() {
    const email = `user${Date.now()}@example.com`;
    return this.eventsService.createUser(email);
  }

  
}
