import 'reflect-metadata';
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../dist/app.module.js';

await test('API com PostgreSQL: JWT, perfil, dispositivos, isolamento e validações', async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  const http = request(app.getHttpServer());
  const users = [];
  const password = 'TesteSeguro123!';
  const suffix = randomUUID();
  let checks = 0;
  async function check(method, path, status, body, token) {
    let req = http[method](path);
    if (token) req = req.set('Authorization', `Bearer ${token}`);
    if (body !== undefined) req = req.send(body);
    const response = await req;
    assert.equal(
      response.status,
      status,
      `${method} ${path}: ${JSON.stringify(response.body)}`,
    );
    checks++;
    return response.body;
  }
  try {
    await check('get', '/devices', 401);
    await check('get', '/users/me', 401);
    await check('post', '/auth/register', 400, {
      name: ' ',
      email: 'invalid',
      password: 'short',
    });
    for (const letter of ['a', 'b']) {
      const email = `smart-home-${suffix}-${letter}@example.com`;
      const user = await check('post', '/auth/register', 201, {
        name: `Teste ${letter}`,
        email,
        password,
      });
      assert.equal(user.passwordHash, undefined);
      const auth = await check('post', '/auth/login', 201, { email, password });
      users.push({ ...user, token: auth.access_token, email });
    }
    const [a, b] = users;
    await check('post', '/auth/register', 409, {
      name: 'Duplicado',
      email: a.email,
      password,
    });
    await check('post', '/auth/login', 401, {
      email: a.email,
      password: 'incorreta',
    });
    await check('post', '/auth/login', 400, {
      email: a.email,
      password,
      extra: true,
    });
    await check('get', '/auth/me', 401, undefined, 'invalid');
    const expired = await new JwtService({
      secret: process.env.JWT_SECRET,
    }).signAsync({ sub: a.id }, { expiresIn: -1 });
    await check('get', '/auth/me', 401, undefined, expired);
    const profile = await check('get', '/auth/me', 200, undefined, a.token);
    assert.equal(profile.id, a.id);
    assert.equal(profile.passwordHash, undefined);
    await check('get', '/users', 404, undefined, a.token);
    await check('get', `/users/${b.id}`, 404, undefined, a.token);
    await check('patch', '/users/me', 409, { email: b.email }, a.token);
    await check('patch', '/users/me', 400, { name: null }, a.token);
    await check('patch', '/users/me', 200, { name: 'Atualizado' }, a.token);
    await check(
      'post',
      '/devices',
      400,
      { name: 'X', type: 'UNKNOWN' },
      a.token,
    );
    await check(
      'post',
      '/devices',
      400,
      { name: 'X', type: 'LIGHT', ownerId: b.id },
      a.token,
    );
    const light = await check(
      'post',
      '/devices',
      201,
      { name: 'Luz', type: 'LIGHT', room: 'Sala' },
      a.token,
    );
    const tv = await check(
      'post',
      '/devices',
      201,
      { name: 'TV', type: 'TV' },
      a.token,
    );
    const ac = await check(
      'post',
      '/devices',
      201,
      { name: 'Ar', type: 'AIR_CONDITIONER' },
      a.token,
    );
    assert.equal(
      (await check('get', '/devices', 200, undefined, a.token)).length,
      3,
    );
    assert.equal(
      (await check('get', '/devices', 200, undefined, b.token)).length,
      0,
    );
    for (const method of ['get', 'patch', 'delete'])
      await check(
        method,
        `/devices/${light.id}`,
        404,
        method === 'patch' ? { name: 'Roubo' } : undefined,
        b.token,
      );
    await check(
      'patch',
      `/devices/${light.id}/state`,
      404,
      { isOn: true },
      b.token,
    );
    await check(
      'post',
      `/devices/${light.id}/actions`,
      404,
      { action: 'TURN_ON' },
      b.token,
    );
    await check(
      'patch',
      `/devices/${light.id}/state`,
      400,
      { volume: 20 },
      a.token,
    );
    await check(
      'patch',
      `/devices/${light.id}/state`,
      400,
      { brightness: 101 },
      a.token,
    );
    await check(
      'patch',
      `/devices/${light.id}/state`,
      400,
      { isOn: 'true' },
      a.token,
    );
    await check('patch', `/devices/${light.id}/state`, 400, {}, a.token);
    await check(
      'post',
      `/devices/${light.id}/actions`,
      400,
      { action: 'SET_TEMPERATURE', value: 22 },
      a.token,
    );
    await check(
      'post',
      `/devices/${light.id}/actions`,
      400,
      { action: 'SET_BRIGHTNESS' },
      a.token,
    );
    await check(
      'post',
      `/devices/${light.id}/actions`,
      201,
      { action: 'TURN_ON' },
      a.token,
    );
    await check(
      'post',
      `/devices/${light.id}/actions`,
      201,
      { action: 'SET_BRIGHTNESS', value: 65 },
      a.token,
    );
    await Promise.all([
      check('patch', `/devices/${tv.id}/state`, 200, { channel: 42 }, a.token),
      check('patch', `/devices/${tv.id}/state`, 200, { volume: 77 }, a.token),
    ]);
    const updated = await check(
      'get',
      `/devices/${tv.id}`,
      200,
      undefined,
      a.token,
    );
    assert.equal(updated.state.channel, 42);
    assert.equal(updated.state.volume, 77);
    await check(
      'post',
      `/devices/${ac.id}/actions`,
      201,
      { action: 'SET_TEMPERATURE', value: 22 },
      a.token,
    );
    await check(
      'patch',
      `/devices/${ac.id}/state`,
      400,
      { temperature: 15 },
      a.token,
    );
    await check(
      'patch',
      `/devices/${light.id}`,
      200,
      { name: 'Luz nova' },
      a.token,
    );
    await check('patch', `/devices/${light.id}`, 400, { type: 'TV' }, a.token);
    await check('delete', `/devices/${light.id}`, 200, undefined, a.token);
    await check('get', `/devices/${light.id}`, 404, undefined, a.token);
    await check('post', '/auth/logout', 201, undefined, a.token);
    await check('delete', '/users/me', 200, undefined, a.token);
    await check('get', '/auth/me', 401, undefined, a.token);
    console.log(`${checks} verificações HTTP aprovadas.`);
  } finally {
    for (const user of users)
      await http
        .delete('/users/me')
        .set('Authorization', `Bearer ${user.token}`);
    await app.close();
  }
});
