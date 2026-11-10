import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service.js';
import type { CreateDeviceDto, UpdateDeviceDto } from '../dto/device.dto.js';
import { initialState } from '../interfaces/device-state.js';
@Injectable()
export class DevicesRepository {
  constructor(private readonly prisma: PrismaService) {}
  create(ownerId: string, dto: CreateDeviceDto) {
    return this.prisma.device.create({ data: { name: dto.name, type: dto.type, room: dto.room, ownerId, ...initialState(dto.type) } });
  }
  list(ownerId: string) {
    return this.prisma.device.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'asc' },
    });
  }
  find(id: string, ownerId: string) {
    return this.prisma.device.findFirst({ where: { id, ownerId } });
  }
  update(id: string, ownerId: string, dto: UpdateDeviceDto) {
    return this.prisma.device.update({ where: { id, ownerId }, data: dto });
  }
  remove(id: string, ownerId: string) {
    return this.prisma.device.delete({ where: { id, ownerId } });
  }
}
