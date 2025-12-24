import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from './dto/user-created-event';

@Injectable()
export class EventsService {
    private readonly logger = new Logger(EventsService.name);
    
    constructor(private eventEmitter: EventEmitter2) {}
    
    //Phát event
    createUser(email: string) {
        const userId = `usser_${Date.now()}`;
        const event = new UserCreatedEvent(userId, email);
        
        this.logger.log("Phát sự kiện tạo người dùng mới");
        this.eventEmitter.emit('user.created', event);

        return { userId, email };
    }

    //Lắng nghe event
   @OnEvent('user.created')
    handleUserCreatedEvent(event: UserCreatedEvent) {
        this.logger.log(`Người dùng mới được tạo: ID=${event.userId}, Email=${event.email}`);
    }

    //Lắng nghe event và gửi email chào mừng
    @OnEvent('user.created')
    sendWelcomeEmail(event: UserCreatedEvent) {
        this.logger.log(`Gửi email chào mừng đến: ${event.email}`);
    }
}
