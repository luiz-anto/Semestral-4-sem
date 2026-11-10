const BASE = (import.meta.env?.VITE_API_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);
export async function request(
  path,
  { token, method = "GET", body, signal } = {},
) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      signal,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Não foi possível conectar à API. Confira se o backend está ligado e a URL está correta.",
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      Array.isArray(data.message)
        ? data.message.join(" ")
        : data.message || "Não foi possível concluir a operação.",
    );
    error.status = response.status;
    throw error;
  }
  return data;
}

const CHATBOT = (
  import.meta.env?.VITE_CHATBOT_URL || "http://localhost:8001"
).replace(/\/$/, "");
// Envia a mensagem ao chatbot (FastAPI), que interpreta e comanda o backend.
export async function sendChatMessage(mensagem, token) {
  let response;
  try {
    response = await fetch(`${CHATBOT}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mensagem }),
    });
  } catch {
    throw new Error("Não foi possível conectar ao chatbot.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Não foi possível enviar a mensagem.",
    );
    error.status = response.status;
    throw error;
  }
  return data;
}
