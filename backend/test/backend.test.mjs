import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StateRepository } from '../dist/devices/repositories/state.repository.js';
import {
  initialState,
  validateState,
} from '../dist/devices/interfaces/device-state.js';
import { DevicesService } from '../dist/devices/services/devices.service.js';

await test('Regras de estado: tipos, limites e propriedades desconhecidas', () => {
  for (const type of ['LIGHT', 'TV', 'AIR_CONDITIONER'])
    assert.equal(initialState(type).isOn, false);
  for (const [type, patch] of [
    ['LIGHT', { brightness: 101 }],
    ['LIGHT', { volume: 5 }],
    ['TV', { channel: 0 }],
    ['TV', { volume: 1.5 }],
    ['AIR_CONDITIONER', { temperature: 31 }],
    ['LIGHT', { isOn: 'true' }],
    ['LIGHT', {}],
    ['LIGHT', null],
    ['LIGHT', []],
  ])
    assert.throws(() => validateState(type, patch));
  assert.deepEqual(
    validateState('TV', { channel: 999, volume: 0, isOn: true }),
    { channel: 999, volume: 0, isOn: true },
  );
  assert.deepEqual(validateState('AIR_CONDITIONER', { temperature: 16 }), {
    temperature: 16,
  });
});

await test('JSON: concorrência, persistência, isolamento e corrupção', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'smart-home-test-'));
  process.env.DEVICE_STATE_PATH = join(dir, 'devices.json');
  try {
    const store = new StateRepository();
    await Promise.all(
      Array.from({ length: 40 }, (_, i) =>
        store.patch(String(i), 'a', initialState('LIGHT'), { brightness: i }),
      ),
    );
    await Promise.all([
      store.patch('tv', 'a', initialState('TV'), { volume: 80 }),
      store.patch('tv', 'a', initialState('TV'), { channel: 25 }),
    ]);
    const restart = new StateRepository();
    assert.deepEqual(await restart.get('tv', 'a', initialState('TV')), {
      isOn: false,
      volume: 80,
      channel: 25,
    });
    assert.equal((await restart.get('tv', 'b', initialState('TV'))).volume, 20);
    assert.equal(
      JSON.parse(await readFile(process.env.DEVICE_STATE_PATH, 'utf8')).devices
        .length,
      41,
    );
    await restart.remove('tv', 'b');
    assert.equal(
      (await restart.get('tv', 'a', initialState('TV'))).channel,
      25,
    );
    await restart.removeOwner('a');
    assert.deepEqual(
      JSON.parse(await readFile(process.env.DEVICE_STATE_PATH, 'utf8')),
      { devices: [] },
    );
    await writeFile(process.env.DEVICE_STATE_PATH, '{invalid');
    await assert.rejects(restart.patch('x', 'a', initialState('LIGHT'), {}));
    assert.equal(
      await readFile(process.env.DEVICE_STATE_PATH, 'utf8'),
      '{invalid',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
    delete process.env.DEVICE_STATE_PATH;
  }
});

await test('Dispositivo de outro proprietário nunca chega ao armazenamento de estados', async () => {
  const service = new DevicesService(
    { find: async () => null },
    { patch: () => assert.fail('Acesso indevido ao JSON') },
  );
  await assert.rejects(
    service.state('other-device', 'user-a', { isOn: true }),
    (error) => error.getStatus() === 404,
  );
});
