import { useEffect, useState } from "react";
import Icon from "../ui/Icon";
import { typeInfo } from "./DeviceCard";
function Slider({
  label,
  value,
  min,
  max,
  suffix = "",
  onChange,
  icon = "sun",
}) {
  return (
    <label className="block text-xs text-[#BBCCEF] [&_strong]:text-lg [&_strong]:text-[#E88211] [&_input]:my-5 [&_input]:h-2 [&_input]:w-full [&_input]:cursor-pointer [&_input]:accent-[#E88211]">
      <span className="flex justify-between items-center">
        <span className="flex items-center gap-2">
          <Icon name={icon} size={17} />
          {label}
        </span>
        <strong>
          {value}
          {suffix}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="flex justify-between text-xs text-[#BBCCEF]/65">
        <span>
          {min}
          {suffix}
        </span>
        <span>
          {max}
          {suffix}
        </span>
      </span>
    </label>
  );
}
export default function DeviceControls({
  device,
  busy,
  onApply,
  onEdit,
  onSimulate,
}) {
  const [draft, setDraft] = useState(device.state);
  useEffect(() => setDraft(device.state), [device.id, device.state]);
  const patch = Object.fromEntries(
    Object.entries(draft).filter(([key, value]) => device.state[key] !== value),
  );
  const changed = Object.keys(patch).length > 0;
  function set(key, value) {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }));
  }
  return (
    <section className="min-w-0 rounded-3xl border border-[#3B6283]/50 bg-[#122849] p-5 text-[#E4EAF0] sm:p-6 ">
      <div className="flex justify-between items-center">
        <p className="text-[10px] uppercase tracking-[.18em] text-[#BBCCEF]/60">
          DO SEU JEITO
        </p>
        <button
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#BBCCEF] hover:bg-[#3B6283]/30"
          onClick={onEdit}
          aria-label={`Editar ${device.name}`}
        >
          <Icon name="edit" size={18} />
        </button>
      </div>
      <div className="relative flex h-36 items-center justify-center text-[#E88211] [&>svg]:relative [&>svg]:z-10">
        <Icon name={typeInfo[device.type].icon} size={74} />
        <span className="absolute h-28 w-28 rounded-full border border-[#3B6283]/50" />
      </div>
      <div className="text-center mb-7">
        <h3 className="text-xl font-semibold tracking-tight">{device.name}</h3>
        <p className="text-[#BBCCEF]/65 text-sm mt-1">
          {device.room || "Sem cômodo"} ·{" "}
          {device.state.isOn ? "Ligado" : "Desligado"}
        </p>
      </div>
      <div className="space-y-5">
        {device.type === "LIGHT" && (
          <Slider
            label="Intensidade"
            value={draft.brightness}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => set("brightness", v)}
          />
        )}
        {device.type === "AIR_CONDITIONER" && (
          <Slider
            label="Temperatura"
            value={draft.temperature}
            min={16}
            max={30}
            suffix=" °C"
            icon="ac"
            onChange={(v) => set("temperature", v)}
          />
        )}
        {device.type === "TV" && (
          <>
            <Slider
              label="Volume"
              value={draft.volume}
              min={0}
              max={100}
              suffix="%"
              icon="tv"
              onChange={(v) => set("volume", v)}
            />
            <label className="flex flex-col gap-2 text-xs text-[#BBCCEF] [&_input]:w-full [&_input]:min-h-12 [&_input]:rounded-xl [&_input]:border [&_input]:border-[#3B6283] [&_input]:bg-[#3B6283]/25 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-[#E4EAF0] [&_input]:outline-none [&_input]:placeholder:text-[#BBCCEF]/40 [&_input:focus]:border-[#E88211] [&_select]:min-h-12 [&_select]:rounded-xl [&_select]:border [&_select]:border-[#3B6283] [&_select]:bg-[#122849] [&_select]:px-4 [&_select]:text-[#E4EAF0]">
              Canal
              <input
                type="number"
                min={1}
                max={999}
                value={draft.channel}
                onChange={(e) => set("channel", Number(e.target.value))}
              />
            </label>
          </>
        )}
      </div>
      <button
        className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#E88211] focus-visible:outline-offset-4 bg-[#E88211] text-[#09193B] hover:bg-[#E88211]/85 w-full justify-center mt-6"
        disabled={
          !changed ||
          busy ||
          (device.type === "TV" &&
            (!Number.isInteger(draft.channel) ||
              draft.channel < 1 ||
              draft.channel > 999))
        }
        onClick={() => onApply(patch)}
      >
        {busy ? "Aplicando…" : changed ? "Aplicar ajustes" : "Tudo ajustado"}
        <Icon name={changed ? "arrow" : "check"} size={17} />
      </button>
      <button
        className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#E88211] focus-visible:outline-offset-4 border-[#3B6283] bg-[#3B6283]/10 text-[#BBCCEF] hover:bg-[#3B6283]/30 w-full justify-center mt-3"
        onClick={onSimulate}
      >
        Abrir simulação <Icon name="arrow" size={17} />
      </button>
    </section>
  );
}
