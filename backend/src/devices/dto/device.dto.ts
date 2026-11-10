import {
  Allow,
  IsIn,
  IsNotEmpty,
  ValidateIf,
  IsString,
  MaxLength,
} from 'class-validator';
export const DEVICE_TYPES = ['LIGHT', 'AIR_CONDITIONER', 'TV'] as const;
export const ROOMS = ['Sala', 'Escritório', 'Quarto'] as const;
export type DeviceKind = (typeof DEVICE_TYPES)[number];
export class CreateDeviceDto {
  @IsString() @IsNotEmpty() @MaxLength(100) name: string;
  @IsIn(DEVICE_TYPES) type: DeviceKind;
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(ROOMS)
  room?: string;
}
export class UpdateDeviceDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(ROOMS)
  room?: string;
}
export class DeviceActionDto {
  @IsIn([
    'TURN_ON',
    'TURN_OFF',
    'SET_BRIGHTNESS',
    'SET_TEMPERATURE',
    'SET_CHANNEL',
    'SET_VOLUME',
  ])
  action: string;
  @Allow() value?: unknown;
}
