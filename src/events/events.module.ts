import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { BullModule } from '@nestjs/bullmq/dist/bull.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
    })
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
