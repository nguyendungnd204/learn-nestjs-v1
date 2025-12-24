import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    @Cron('* 5 * * * *')
    handleCron() {
        this.logger.debug('Cron job chạy vào giây 15 mỗi phút');
    }

    @Interval(100000)
    handleInterval() {
        this.logger.debug('Interval vòng lặp lặp lại sau mỗi 10 giây');
    }

    @Timeout(5000)
    handleTimeout() {
        this.logger.debug('Timeout chạy sau 5 giây chỉ một lần sau khi khởi động ứng dụng');
    }

}
// test đẩy đồng thời nhiều job