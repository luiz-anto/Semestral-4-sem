import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service.js';
import type { DeviceState } from '../interfaces/device-state.js';

type StateColumns = {
  isOn: boolean;
  brightness: number | null;
  temperature: number | null;
  channel: number | null;
  volume: number | null;
};

// Estado do dispositivo guardado nas colunas da tabela Device (Postgres).
@Injectable()
export class StateRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Converte as colunas no objeto "state", mantendo so os campos do tipo.
  toState(device: StateColumns & { type: string }): DeviceState {
    const state: DeviceState = { isOn: device.isOn };
    if (device.type === 'LIGHT' && device.brightness !== null)
      state.brightness = device.brightness;
    if (device.type === 'AIR_CONDITIONER' && device.temperature !== null)
      state.temperature = device.temperature;
    if (device.type === 'TV') {
      if (device.channel !== null) state.channel = device.channel;
      if (device.volume !== null) state.volume = device.volume;
    }
    return state;
  }

  async patch(id: string, ownerId: string, patch: Partial<DeviceState>) {
    const device = await this.prisma.device.update({
      where: { id, ownerId },
      data: patch,
    });
    return this.toState(device);
  }
}
