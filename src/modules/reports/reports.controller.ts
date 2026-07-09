import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user-role.enum'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto'
import { CreateReportDto } from './dto/create-report.dto'
import { ResolveReportDto } from './dto/resolve-report.dto'
import { ReportsService } from './reports.service'

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() dto: CreateReportDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.create(dto, user.id)
  }

  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get()
  findPending(@Query() query: PaginationQueryDto) {
    return this.reportsService.findPending(query.page, query.limit)
  }

  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Post(':id/resolve')
  resolve(@Param('id') id: string, @Body() dto: ResolveReportDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.resolve(id, dto, user.id)
  }
}
