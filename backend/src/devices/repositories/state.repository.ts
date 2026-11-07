import { Injectable } from '@nestjs/common';
import { mkdir, readFile, rename, writeFile, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { DeviceState } from '../interfaces/device-state.js';
export interface StateRecord {
  id: string;
  ownerId: string;
  state: DeviceState;
}
interface StateFile {
  devices: StateRecord[];
}
@Injectable()
export class StateRepository {
  private readonly file = resolve(
    process.env.DEVICE_STATE_PATH ?? 'data/devices.json',
  );
  private queue: Promise<unknown> = Promise.resolve();
  private exclusive<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.queue.then(fn);
    this.queue = next.catch(() => undefined);
    return next;
  }
  private async read(): Promise<StateFile> {
    try {
      const data = JSON.parse(await readFile(this.file, 'utf8')) as StateFile;
      if (
        !data ||
        !Array.isArray(data.devices) ||
        data.devices.some(
          (d) =>
            !d ||
            typeof d.id !== 'string' ||
            typeof d.ownerId !== 'string' ||
            !d.state ||
            typeof d.state.isOn !== 'boolean',
        )
      )
        throw new Error('Arquivo de estados inválido.');
      return data;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT')
        return { devices: [] };
      throw error;
    }
  }
  private async write(data: StateFile) {
    await mkdir(dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${randomUUID()}.tmp`;
    try {
      await writeFile(tmp, JSON.stringify(data, null, 2), { flag: 'wx' });
      await rename(tmp, this.file);
    } finally {
      await unlink(tmp).catch(() => undefined);
    }
  }
  get(id: string, ownerId: string, fallback: DeviceState) {
    return this.exclusive(
      async () =>
        (await this.read()).devices.find(
          (d) => d.id === id && d.ownerId === ownerId,
        )?.state ?? fallback,
    );
  }
  patch(
    id: string,
    ownerId: string,
    fallback: DeviceState,
    patch: Partial<DeviceState>,
  ) {
    return this.exclusive(async () => {
      const data = await this.read();
      let record = data.devices.find(
        (d) => d.id === id && d.ownerId === ownerId,
      );
      if (!record) {
        record = { id, ownerId, state: fallback };
        data.devices.push(record);
      }
      record.state = { ...record.state, ...patch };
      await this.write(data);
      return record.state;
    });
  }
  remove(id: string, ownerId: string) {
    return this.exclusive(async () => {
      const data = await this.read();
      data.devices = data.devices.filter(
        (d) => d.id !== id || d.ownerId !== ownerId,
      );
      await this.write(data);
    });
  }
  removeOwner(ownerId: string) {
    return this.exclusive(async () => {
      const data = await this.read();
      data.devices = data.devices.filter((d) => d.ownerId !== ownerId);
      await this.write(data);
    });
  }
}
