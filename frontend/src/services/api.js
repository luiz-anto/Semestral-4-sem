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
