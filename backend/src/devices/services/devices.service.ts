import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DevicesRepository } from '../repositories/devices.repository.js';
import { StateRepository } from '../repositories/state.repository.js';
import { validateState } from '../interfaces/device-state.js';
import type {
  CreateDeviceDto,
  UpdateDeviceDto,
  DeviceActionDto,
} from '../dto/device.dto.js';
@Injectable()
export class DevicesService {
  constructor(
    private readonly devices: DevicesRepository,
    private readonly states: StateRepository,
  ) {}
  private async owned(id: string, ownerId: string) {
    const device = await this.devices.find(id, ownerId);
    if (!device) throw new NotFoundException('Dispositivo não encontrado.');
    return device;
  }
  private withState(device: Awaited<ReturnType<DevicesRepository['create']>>) {
    const {
      isOn: _isOn,
      brightness: _brightness,
      temperature: _temperature,
      channel: _channel,
      volume: _volume,
      ...base
    } = device;
    return { ...base, state: this.states.toState(device) };
  }
  async create(ownerId: string, dto: CreateDeviceDto) {
    if (!dto.name.trim()) throw new BadRequestException('Nome obrigatório.');
    const device = await this.devices.create(ownerId, {
      type: dto.type,
      room: dto.room,
      name: dto.name.trim(),
    });
    return this.withState(device);
  }
  async list(ownerId: string) {
    return (await this.devices.list(ownerId)).map((d) => this.withState(d));
  }
  async find(id: string, ownerId: string) {
    return this.withState(await this.owned(id, ownerId));
  }
  async update(id: string, ownerId: string, dto: UpdateDeviceDto) {
    await this.owned(id, ownerId);
    if (dto.name !== undefined && !dto.name.trim())
      throw new BadRequestException('Nome obrigatório.');
    return this.withState(await this.devices.update(id, ownerId, dto));
  }
  async remove(id: string, ownerId: string) {
    await this.owned(id, ownerId);
    await this.devices.remove(id, ownerId);
    return { message: 'Dispositivo excluído.' };
  }
  async state(id: string, ownerId: string, patch: unknown) {
    const device = await this.owned(id, ownerId);
    return {
      ...this.withState(device),
      state: await this.states.patch(
        id,
        ownerId,
        validateState(device.type, patch),
      ),
    };
  }
  async action(id: string, ownerId: string, dto: DeviceActionDto) {
    const fields: Record<string, string> = {
      SET_BRIGHTNESS: 'brightness',
      SET_TEMPERATURE: 'temperature',
      SET_CHANNEL: 'channel',
      SET_VOLUME: 'volume',
    };
    if (dto.action === 'TURN_ON' || dto.action === 'TURN_OFF') {
      if (dto.value !== undefined)
        throw new BadRequestException('Esta ação não recebe value.');
      return this.state(id, ownerId, { isOn: dto.action === 'TURN_ON' });
    }
    const field = fields[dto.action];
    if (!field) throw new BadRequestException('Ação inválida.');
    return this.state(id, ownerId, { [field]: dto.value });
  }
}
