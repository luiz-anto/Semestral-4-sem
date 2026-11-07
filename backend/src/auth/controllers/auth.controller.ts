import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service.js';
import { CreateUserDto } from '../../users/dto/create-user.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() dto: CreateUserDto) {
    return this.auth.register(dto);
  }
  @Post('login') login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }
  @UseGuards(JwtAuthGuard) @Get('me') me(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return user;
  }
  @UseGuards(JwtAuthGuard) @Post('logout') logout() {
    return { message: 'Remova o token no cliente para encerrar a sessão.' };
  }
}
