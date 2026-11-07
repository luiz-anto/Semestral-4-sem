import { BadRequestException } from '@nestjs/common';
import type { DeviceKind } from '../dto/device.dto.js';
export type DeviceState = {
  isOn: boolean;
  brightness?: number;
  temperature?: number;
  channel?: number;
  volume?: number;
};
export function initialState(type: DeviceKind): DeviceState {
  switch (type) {
    case 'LIGHT':
      return { isOn: false, brightness: 100 };
    case 'AIR_CONDITIONER':
      return { isOn: false, temperature: 22 };
    case 'TV':
      return { isOn: false, channel: 1, volume: 20 };
  }
}
export function validateState(
  type: DeviceKind,
  patch: unknown,
): Partial<DeviceState> {
  if (
    !patch ||
    typeof patch !== 'object' ||
    Array.isArray(patch) ||
    !Object.keys(patch).length
  )
    throw new BadRequestException(
      'Informe ao menos uma propriedade do estado.',
    );
  const limits: Record<string, [number, number]> =
    type === 'LIGHT'
      ? { brightness: [0, 100] }
      : type === 'AIR_CONDITIONER'
        ? { temperature: [16, 30] }
        : { channel: [1, 999], volume: [0, 100] };
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'isOn') {
      if (typeof value !== 'boolean')
        throw new BadRequestException('isOn deve ser booleano.');
    } else if (
      !(key in limits) ||
      typeof value !== 'number' ||
      !Number.isInteger(value) ||
      value < limits[key][0] ||
      value > limits[key][1]
    )
      throw new BadRequestException(
        `Propriedade ou valor incompatível: ${key}.`,
      );
  }
  return patch as Partial<DeviceState>;
}
