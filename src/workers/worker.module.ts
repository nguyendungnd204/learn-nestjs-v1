import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';
import { WorkerProcessor } from './worker.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'worker-queue',
    }),
  ],
  controllers: [WorkerController],
  providers: [WorkerService, WorkerProcessor],
  exports: [WorkerService],
})
export class WorkerModule {}
