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
    <article
      className={`group relative min-w-0 rounded-2xl border border-[#3B6283]/50 bg-[#E4EAF0] p-4 text-[#09193B] sm:p-6 ${selected ? "ring-2 ring-[#E88211] ring-offset-2 ring-offset-[#09193B]" : ""}`}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#BBCCEF]/60 text-[#3B6283]">
          <Icon name={info.icon} size={27} />
        </span>
        <span
          className={`flex items-center gap-1 text-[9px] text-[#3B6283] [&>i]:h-1 [&>i]:w-1 [&>i]:rounded-full [&>i]:bg-[#3B6283] ${device.state.isOn ? "!text-[#09193B] [&>i]:!bg-[#E88211]" : ""}`}
        >
          <i />
          {device.state.isOn ? "Ligado" : "Desligado"}
        </span>
      </div>
      <button
        className="block w-full min-w-0 py-6 text-left [&_h3]:text-sm sm:[&_h3]:text-lg [&_h3]:leading-snug [&_h3]:wrap-anywhere"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`Controlar ${device.name}`}
      >
        <span className="mb-2 block text-[10px] text-[#3B6283]">
          {device.room || "Sem cômodo"}
        </span>
        <h3>{device.name}</h3>
        <span className="mt-2 block text-[10px] sm:text-xs text-[#3B6283]">
          {info.status(device.state)}
        </span>
      </button>
      <div className="flex items-center justify-between gap-2 border-t border-[#3B6283]/20 pt-3 text-[9px] sm:text-xs text-[#3B6283]">
        <span>{info.label}</span>
        <button
          type="button"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#BBCCEF] text-[#3B6283] transition hover:scale-105 disabled:opacity-40 ${device.state.isOn ? "!bg-[#E88211] !text-[#09193B]" : ""}`}
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
