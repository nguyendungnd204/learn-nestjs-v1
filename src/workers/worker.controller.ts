import { Controller, Post, Get, Body, Param, Delete, Logger } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { EmailJobDto, ReportJobDto, ImageProcessJobDto, BulkJobDto } from './dto/job-data.dto';

@Controller('workers')
export class WorkerController {
  private readonly logger = new Logger(WorkerController.name);

  constructor(private readonly workerService: WorkerService) {}

  // Thêm email job
  @Post('email')
  async addEmail(@Body() data: any) {
    this.logger.debug(`📧 Email data: ${JSON.stringify(data)}`);
    return this.workerService.addEmailJob(data || {});
  }

  // Thêm  report job
  @Post('report')
  async addReport(@Body() body: any) {
    const delay = body?.delay;
    const data = body || {};
    this.logger.debug(`📊 Report data: ${JSON.stringify(data)}`);
    return this.workerService.addReportJob(data, delay);
  }

  // Thêm image processing job
  @Post('image')
  async addImage(@Body() data: any) {
    this.logger.debug(`🖼️ Image data: ${JSON.stringify(data)}`);
    return this.workerService.addImageProcessJob(data || {});
  }

  // Đẩy nhiều job cùng lúc
  @Post('bulk')
  async addBulkJobs(@Body() data: any) {
    this.logger.debug(`📦 Received: count=${data?.count}, jobType=${data?.jobType}`);
    return this.workerService.addBulkJobs(data);
  }

  // Lấy thống kê queue
  @Get('stats')
  async getStats() {
    return this.workerService.getQueueStats();
  }

  // Lấy trạng thái job cụ thể
  @Get('job/:id')
  async getJobStatus(@Param('id') id: string) {
    return this.workerService.getJobStatus(id);
  }

  // Xóa completed jobs
  @Delete('clean/completed')
  async cleanCompleted() {
    return this.workerService.cleanCompletedJobs();
  }

  // Xóa failed jobs
  @Delete('clean/failed')
  async cleanFailed() {
    return this.workerService.cleanFailedJobs();
  }

  // Tạm dừng queue
  @Post('pause')
  async pauseQueue() {
    return this.workerService.pauseQueue();
  }

  // Tiếp tục queue
  @Post('resume')
  async resumeQueue() {
    return this.workerService.resumeQueue();
  }
}
