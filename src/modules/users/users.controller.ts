import { Body, Controller, Get, Put } from '@nestjs/common'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    const found = await this.usersService.findById(user.id)
    return this.usersService.toPublicProfile(found)
  }

  @Put('profile')
  async updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    const updated = await this.usersService.updateProfile(user.id, dto)
    return this.usersService.toPublicProfile(updated)
  }
}
