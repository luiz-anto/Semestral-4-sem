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
    <label className="control-field">
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
        style={{
          "--range-progress": `${((value - min) / (max - min)) * 100}%`,
        }}
      />
      <span className="flex justify-between text-xs muted">
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
    setDraft((previous) => ({ ...previous, [key]: value }));
  }
  return (
    <section className="panel control-panel">
      <div className="flex justify-between items-center">
        <p className="eyebrow">DO SEU JEITO</p>
        <button
          className="icon-button"
          onClick={onEdit}
          aria-label={`Editar ${device.name}`}
        >
          <Icon name="edit" size={18} />
        </button>
      </div>
      <div className="control-illustration">
        <Icon name={typeInfo[device.type].icon} size={74} />
        <span className="control-orbit" />
      </div>
      <div className="text-center mb-7">
        <h3 className="text-xl font-semibold tracking-tight">{device.name}</h3>
        <p className="muted text-sm mt-1">
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
            <label className="field">
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
        className="button button-dark w-full justify-center mt-6"
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
        className="button button-outline w-full justify-center mt-3"
        onClick={onSimulate}
      >
        Abrir simulação <Icon name="arrow" size={17} />
      </button>
    </section>
  );
}
