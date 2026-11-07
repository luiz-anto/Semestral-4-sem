import test from "node:test";
import assert from "node:assert/strict";
import { request } from "../src/services/api.js";
await test("API envia JWT, JSON e método corretamente; preserva status de sessão expirada", async () => {
  const original = globalThis.fetch;
  try {
    let captured;
    globalThis.fetch = async (url, options) => {
      captured = { url, options };
      return new Response(JSON.stringify({ id: "device" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };
    assert.deepEqual(
      await request("/devices/id/state", {
        token: "test-token",
        method: "PATCH",
        body: { isOn: true },
      }),
      { id: "device" },
    );
    assert.equal(captured.options.headers.Authorization, "Bearer test-token");
    assert.equal(captured.options.body, '{"isOn":true}');
    assert.equal(captured.options.method, "PATCH");
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "Sessão expirada" }), {
        status: 401,
      });
    await assert.rejects(
      request("/auth/me", { token: "expired" }),
      (error) => error.status === 401 && error.message === "Sessão expirada",
    );
    globalThis.fetch = async () => {
      throw new TypeError("Failed to fetch");
    };
    await assert.rejects(
      request("/devices"),
      /Não foi possível conectar à API/,
    );
  } finally {
    globalThis.fetch = original;
  }
});
