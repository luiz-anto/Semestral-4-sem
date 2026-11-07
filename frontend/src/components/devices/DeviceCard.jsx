import Icon from "../ui/Icon";
export const typeInfo = {
  LIGHT: {
    icon: "light",
    label: "Iluminação",
    status: (s) => `${s.brightness}% de intensidade`,
  },
  TV: {
    icon: "tv",
    label: "Televisão",
    status: (s) => `Canal ${s.channel} · Volume ${s.volume}`,
  },
  AIR_CONDITIONER: {
    icon: "ac",
    label: "Climatização",
    status: (s) => `${s.temperature} °C · Temperatura`,
  },
};
export default function DeviceCard({
  device,
  selected,
  busy,
  onSelect,
  onToggle,
}) {
  const info = typeInfo[device.type];
  return (
    <article className={`device-card ${selected ? "selected" : ""}`}>
      <div className="flex justify-between items-start gap-2">
        <span className="device-symbol">
          <Icon name={info.icon} size={27} />
        </span>
        <span className={`state-label ${device.state.isOn ? "on" : ""}`}>
          <i />
          {device.state.isOn ? "Ligado" : "Desligado"}
        </span>
      </div>
      <button
        className="device-select"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`Controlar ${device.name}`}
      >
        <span className="device-room">{device.room || "Sem cômodo"}</span>
        <h3>{device.name}</h3>
        <span className="device-reading">{info.status(device.state)}</span>
      </button>
      <div className="card-bottom">
        <span>{info.label}</span>
        <button
          type="button"
          className={`power-button ${device.state.isOn ? "is-on" : ""}`}
          role="switch"
          aria-checked={device.state.isOn}
          aria-label={`Energia de ${device.name}`}
          onClick={onToggle}
          disabled={busy}
        >
          <Icon name="power" size={19} />
        </button>
      </div>
    </article>
  );
}
