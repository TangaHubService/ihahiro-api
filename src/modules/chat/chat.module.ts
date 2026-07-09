import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatMessage } from './entities/chat-message.entity'
import { ChatThread } from './entities/chat-thread.entity'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'

@Module({
  imports: [TypeOrmModule.forFeature([ChatThread, ChatMessage])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
