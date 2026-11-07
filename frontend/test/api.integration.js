import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { request } from "../src/services/api.js";
await test("Cliente frontend → HTTP → NestJS → PostgreSQL/JSON", async () => {
  const email = `frontend-${randomUUID()}@example.com`;
  const password = "TesteFrontend123!";
  let token;
  try {
    const user = await request("/auth/register", {
      method: "POST",
      body: { name: "Teste Frontend", email, password },
    });
    const auth = await request("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    token = auth.access_token;
    assert.equal((await request("/auth/me", { token })).id, user.id);
    const device = await request("/devices", {
      token,
      method: "POST",
      body: { name: "Luz integração", room: "Sala", type: "LIGHT" },
    });
    const updated = await request(`/devices/${device.id}/state`, {
      token,
      method: "PATCH",
      body: { isOn: true, brightness: 62 },
    });
    assert.deepEqual(updated.state, { isOn: true, brightness: 62 });
    assert.equal((await request("/devices", { token })).length, 1);
    await request(`/devices/${device.id}`, {
      token,
      method: "PATCH",
      body: { name: "Luz atualizada" },
    });
    assert.equal(
      (await request(`/devices/${device.id}`, { token })).name,
      "Luz atualizada",
    );
    await request(`/devices/${device.id}`, { token, method: "DELETE" });
    assert.equal((await request("/devices", { token })).length, 0);
  } finally {
    if (token) await request("/users/me", { token, method: "DELETE" });
  }
});
