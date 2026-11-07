import { Module } from '@nestjs/common';
import { DevicesController } from './controllers/devices.controller.js';
import { DevicesService } from './services/devices.service.js';
import { DevicesRepository } from './repositories/devices.repository.js';
import { StateModule } from './state.module.js';
@Module({
  imports: [StateModule],
  controllers: [DevicesController],
  providers: [DevicesService, DevicesRepository],
})
export class DevicesModule {}
