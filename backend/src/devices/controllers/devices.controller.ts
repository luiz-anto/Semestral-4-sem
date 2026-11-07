import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { DevicesService } from '../services/devices.service.js';
import {
  CreateDeviceDto,
  UpdateDeviceDto,
  DeviceActionDto,
} from '../dto/device.dto.js';
@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}
  @Post() create(
    @CurrentUser() u: AuthenticatedUser,
    @Body() d: CreateDeviceDto,
  ) {
    return this.devices.create(u.id, d);
  }
  @Get() list(@CurrentUser() u: AuthenticatedUser) {
    return this.devices.list(u.id);
  }
  @Get(':id') find(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.devices.find(id, u.id);
  }
  @Patch(':id') update(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: UpdateDeviceDto,
  ) {
    return this.devices.update(id, u.id, d);
  }
  @Delete(':id') remove(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.devices.remove(id, u.id);
  }
  @Patch(':id/state') state(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: unknown,
  ) {
    return this.devices.state(id, u.id, d);
  }
  @Post(':id/actions') action(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: DeviceActionDto,
  ) {
    return this.devices.action(id, u.id, d);
  }
}
