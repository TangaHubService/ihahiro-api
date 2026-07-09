import { Controller, Get, Param, Post, Query } from '@nestjs/common'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'
import { NotificationsService } from './notifications.service'

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@Query() query: PaginationQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.list(user.id, query.page, query.limit)
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: AuthenticatedUser) {
    const count = await this.notificationsService.unreadCount(user.id)
    return { count }
  }

  @Post('read/:id')
  markRead(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markRead(id, user.id)
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllRead(user.id)
  }
}
