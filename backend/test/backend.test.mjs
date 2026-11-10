import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialState,
  validateState,
} from '../dist/devices/interfaces/device-state.js';
import { StateRepository } from '../dist/devices/repositories/state.repository.js';
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

await test('Dispositivo de outro proprietário nunca chega ao banco de estados', async () => {
  const service = new DevicesService(
    { find: async () => null },
    { patch: () => assert.fail('Acesso indevido ao banco de estados') },
  );
  await assert.rejects(
    service.state('other-device', 'user-a', { isOn: true }),
    (error) => error.getStatus() === 404,
  );
});

await test('Estado vem das colunas do banco: isOn e temperatura', () => {
  const repo = new StateRepository({});
  const col = { isOn: true, brightness: null, temperature: 24, channel: null, volume: null };
  assert.deepEqual(repo.toState({ ...col, type: 'AIR_CONDITIONER' }), {
    isOn: true,
    temperature: 24,
  });
  assert.deepEqual(repo.toState({ ...col, type: 'LIGHT', brightness: 50 }), {
    isOn: true,
    brightness: 50,
  });
});
