import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'
import { ChatService } from './chat.service'
import { CreateThreadDto } from './dto/create-thread.dto'
import { SendMessageDto } from './dto/send-message.dto'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('threads')
  listThreads(@CurrentUser() user: AuthenticatedUser) {
    return this.chatService.listThreads(user.id)
  }

  @Post('threads')
  createThread(@Body() dto: CreateThreadDto, @CurrentUser() user: AuthenticatedUser) {
    return this.chatService.createOrFindThread(dto, user.id)
  }

  @Get('threads/:id/messages')
  listMessages(
    @Param('id') id: string,
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.chatService.listMessages(id, user.id, query.page, query.limit)
  }

  @Post('threads/:id/messages')
  sendMessage(@Param('id') id: string, @Body() dto: SendMessageDto, @CurrentUser() user: AuthenticatedUser) {
    return this.chatService.sendMessage(id, user.id, dto.body)
  }

  @Post('threads/:id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.chatService.markRead(id, user.id)
  }
}
