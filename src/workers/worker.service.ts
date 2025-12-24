import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailJobDto, ReportJobDto, ImageProcessJobDto, BulkJobDto } from './dto/job-data.dto';

@Injectable()
export class WorkerService {
  private readonly logger = new Logger(WorkerService.name);

  constructor(
    @InjectQueue('worker-queue') private workerQueue: Queue,
  ) {}

  // Thêm 1 job đơn
  async addEmailJob(data: EmailJobDto) {
    const job = await this.workerQueue.add('send-email', data, {
      priority: data?.priority || 5,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    this.logger.log(`➕ Email job ${job.id} đã thêm vào queue`);
    return { jobId: job.id, name: job.name };
  }

  async addReportJob(data: ReportJobDto, delay?: number) {
    const job = await this.workerQueue.add('generate-report', data, {
      priority: 3,
      delay: delay || 0, // Delay trước khi xử lý (ms)
      attempts: 2,
    });

    this.logger.log(`➕ Report job ${job.id} đã thêm vào queue (delay: ${delay || 0}ms)`);
    return { jobId: job.id, name: job.name };
  }

  async addImageProcessJob(data: ImageProcessJobDto) {
    const job = await this.workerQueue.add('process-image', data, {
      priority: 7, // Priority cao hơn
      attempts: 5,
    });

    this.logger.log(`➕ Image job ${job.id} đã thêm vào queue`);
    return { jobId: job.id, name: job.name };
  }

  // Đẩy nhiều job cùng lúc (Bulk)
  async addBulkJobs(bulkData: any) {
    const count = bulkData?.count || 10;
    const jobType = bulkData?.jobType || 'email';
    
    const jobs: Array<{ name: string; data: any; opts?: any }> = [];

    this.logger.log(`🚀 Bắt đầu tạo ${count} jobs loại ${jobType}...`);

    const startTime = Date.now();

    // Tạo danh sách jobs
    for (let i = 0; i < count; i++) {
      let jobName: string;
      let jobData: any;

      switch (jobType) {
        case 'email':
          jobName = 'send-email';
          jobData = {
            to: `user${i}@example.com`,
            subject: `Bulk Email ${i + 1}`,
            body: `This is bulk email number ${i + 1}`,
            priority: Math.floor(Math.random() * 10) + 1,
          };
          break;
        case 'report':
          jobName = 'generate-report';
          jobData = {
            reportType: 'monthly',
            userId: `user_${i}`,
            dateRange: {
              from: new Date(),
              to: new Date(),
            },
          };
          break;
        case 'image':
          jobName = 'process-image';
          jobData = {
            imageUrl: `https://example.com/image${i}.jpg`,
            operations: ['resize', 'compress'],
            userId: `user_${i}`,
          };
          break;
        default:
          jobName = 'heavy-task';
          jobData = { taskId: i };
      }

      jobs.push({
        name: jobName,
        data: jobData,
        opts: {
          priority: Math.floor(Math.random() * 10) + 1,
          attempts: 3,
        },
      });
    }

    // Thêm tất cả jobs cùng lúc
    const addedJobs = await this.workerQueue.addBulk(jobs);

    const duration = Date.now() - startTime;

    this.logger.log(`✅ Đã thêm ${addedJobs.length} jobs trong ${duration}ms`);

    return {
      totalJobs: addedJobs.length,
      jobIds: addedJobs.map(j => j.id),
      duration: `${duration}ms`,
    };
  }

  // Lấy trạng thái queue
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.workerQueue.getWaitingCount(),
      this.workerQueue.getActiveCount(),
      this.workerQueue.getCompletedCount(),
      this.workerQueue.getFailedCount(),
      this.workerQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  // Lấy thông tin job cụ thể
  async getJobStatus(jobId: string) {
    const job = await this.workerQueue.getJob(jobId);

    if (!job) {
      return { error: 'Job not found' };
    }

    const state = await job.getState();
    const progress = job.progress;

    return {
      id: job.id,
      name: job.name,
      state,
      progress,
      data: job.data,
      attemptsMade: job.attemptsMade,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
    };
  }

  // Xóa tất cả completed jobs
  async cleanCompletedJobs() {
    const count = await this.workerQueue.clean(0, 1000, 'completed');
    this.logger.log(`🗑️ Đã xóa ${count.length} completed jobs`);
    return { deletedCount: count.length };
  }

  // Xóa tất cả failed jobs
  async cleanFailedJobs() {
    const count = await this.workerQueue.clean(0, 1000, 'failed');
    this.logger.log(`🗑️ Đã xóa ${count.length} failed jobs`);
    return { deletedCount: count.length };
  }

  // Pause queue
  async pauseQueue() {
    await this.workerQueue.pause();
    this.logger.log(`⏸️ Queue đã tạm dừng`);
    return { status: 'paused' };
  }

  // Resume queue
  async resumeQueue() {
    await this.workerQueue.resume();
    this.logger.log(`▶️ Queue đã tiếp tục`);
    return { status: 'active' };
  }
}
