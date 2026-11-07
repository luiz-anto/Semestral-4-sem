import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get('me') me(@CurrentUser() user: AuthenticatedUser) {
    return this.users.findOne(user.id);
  }
  @Patch('me') update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.users.update(user.id, dto);
  }
  @Delete('me') remove(@CurrentUser() user: AuthenticatedUser) {
    return this.users.remove(user.id);
  }
}
