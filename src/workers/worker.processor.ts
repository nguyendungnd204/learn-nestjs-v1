import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailJobDto, ReportJobDto, ImageProcessJobDto } from './dto/job-data.dto';

@Processor('worker-queue', {
  concurrency: 5, // Xử lý 5 job đồng thời
})
export class WorkerProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkerProcessor.name);

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`🔄 [${job.name}] Job ${job.id} bắt đầu | Priority: ${job.opts.priority || 0} | Attempt: ${job.attemptsMade + 1}`);

    try {
      let result: any;

      switch (job.name) {
        case 'send-email':
          result = await this.handleSendEmail(job);
          break;
        case 'generate-report':
          result = await this.handleGenerateReport(job);
          break;
        case 'process-image':
          result = await this.handleProcessImage(job);
          break;
        case 'heavy-task':
          result = await this.handleHeavyTask(job);
          break;
        default:
          result = await this.handleGenericJob(job);
      }

      this.logger.log(`✅ [${job.name}] Job ${job.id} hoàn thành`);
      return result;
    } catch (error) {
      this.logger.error(`❌ [${job.name}] Job ${job.id} thất bại: ${error.message}`);
      throw error;
    }
  }

  private async handleSendEmail(job: Job<EmailJobDto>) {
    const { to, subject, body } = job.data;
    this.logger.debug(`📧 Gửi email đến ${to}: ${subject}`);
    
    // Giả lập gửi email (2-4 giây)
    const delay = Math.random() * 2000 + 2000;
    await this.sleep(delay);
    
    return {
      success: true,
      emailId: `email_${Date.now()}`,
      sentTo: to,
    };
  }

  private async handleGenerateReport(job: Job<ReportJobDto>) {
    const { reportType, userId } = job.data;
    this.logger.debug(`📊 Tạo báo cáo ${reportType} cho user ${userId}`);
    
    // Giả lập tạo báo cáo (3-5 giây)
    const delay = Math.random() * 2000 + 3000;
    await this.sleep(delay);
    
    return {
      success: true,
      reportUrl: `/reports/${reportType}_${userId}_${Date.now()}.pdf`,
      generatedAt: new Date(),
    };
  }

  private async handleProcessImage(job: Job<ImageProcessJobDto>) {
    const { imageUrl, operations, userId } = job.data;
    this.logger.debug(`🖼️ Xử lý ảnh ${imageUrl} với ${operations.length} operations`);
    
    // Giả lập xử lý ảnh (4-6 giây)
    const delay = Math.random() * 2000 + 4000;
    await this.sleep(delay);
    
    return {
      success: true,
      processedUrl: `/processed/${userId}/${Date.now()}.jpg`,
      operations: operations,
    };
  }

  private async handleHeavyTask(job: Job) {
    this.logger.debug(`⚙️ Xử lý heavy task...`);
    
    // Giả lập công việc nặng (5-8 giây)
    const delay = Math.random() * 3000 + 5000;
    await this.sleep(delay);
    
    return {
      success: true,
      processedItems: Math.floor(Math.random() * 1000) + 1,
    };
  }

  private async handleGenericJob(job: Job) {
    this.logger.debug(`🔧 Xử lý generic job...`);
    await this.sleep(1000);
    return { success: true };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
