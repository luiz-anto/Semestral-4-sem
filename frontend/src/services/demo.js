const KEY = "smart-home-demo-v1";
export const demoUser = {
  id: "demo",
  name: "Alex",
  email: "alex@demonstracao.local",
};
const initial = [
  {
    id: "demo-1",
    name: "Luz principal",
    type: "LIGHT",
    room: "Sala",
    state: { isOn: true, brightness: 70 },
  },
  {
    id: "demo-2",
    name: "Ar-condicionado",
    type: "AIR_CONDITIONER",
    room: "Quarto",
    state: { isOn: true, temperature: 22 },
  },
  {
    id: "demo-3",
    name: "Smart TV",
    type: "TV",
    room: "Sala",
    state: { isOn: false, channel: 12, volume: 25 },
  },
  {
    id: "demo-4",
    name: "Luz de apoio",
    type: "LIGHT",
    room: "Quarto",
    state: { isOn: false, brightness: 40 },
  },
];
export function loadDemo() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(data)) return data;
  } catch {}
  return structuredClone(initial);
}
export function saveDemo(devices) {
  localStorage.setItem(KEY, JSON.stringify(devices));
}
export function defaultState(type) {
  return type === "LIGHT"
    ? { isOn: false, brightness: 100 }
    : type === "TV"
      ? { isOn: false, channel: 1, volume: 20 }
      : { isOn: false, temperature: 22 };
}
