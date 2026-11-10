import { useState } from "react";
import Icon from "../ui/Icon";
const ROOMS = ["Sala", "Escritório", "Quarto"];
export default function DeviceForm({ device, onSave, onDelete }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    data.name = data.name.trim();
    data.room = data.room.trim();
    try {
      await onSave(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="flex flex-col gap-2 text-xs text-[#BBCCEF] [&_input]:w-full [&_input]:min-h-12 [&_input]:rounded-xl [&_input]:border [&_input]:border-[#3B6283] [&_input]:bg-[#3B6283]/25 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-[#E4EAF0] [&_input]:outline-none [&_input]:placeholder:text-[#BBCCEF]/40 [&_input:focus]:border-[#E88211] [&_select]:min-h-12 [&_select]:rounded-xl [&_select]:border [&_select]:border-[#3B6283] [&_select]:bg-[#122849] [&_select]:px-4 [&_select]:text-[#E4EAF0]">
        Nome do dispositivo
        <input
          name="name"
          defaultValue={device?.name}
          required
          maxLength={100}
          placeholder="Ex.: Luz da sala"
          autoFocus
        />
      </label>
      {!device && (
        <label className="flex flex-col gap-2 text-xs text-[#BBCCEF] [&_input]:w-full [&_input]:min-h-12 [&_input]:rounded-xl [&_input]:border [&_input]:border-[#3B6283] [&_input]:bg-[#3B6283]/25 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-[#E4EAF0] [&_input]:outline-none [&_input]:placeholder:text-[#BBCCEF]/40 [&_input:focus]:border-[#E88211] [&_select]:min-h-12 [&_select]:rounded-xl [&_select]:border [&_select]:border-[#3B6283] [&_select]:bg-[#122849] [&_select]:px-4 [&_select]:text-[#E4EAF0]">
          Tipo
          <select name="type" defaultValue="LIGHT">
            <option value="LIGHT">Lâmpada</option>
            <option value="AIR_CONDITIONER">Ar-condicionado</option>
            <option value="TV">Televisão</option>
          </select>
        </label>
      )}
      <label className="flex flex-col gap-2 text-xs text-[#BBCCEF] [&_input]:w-full [&_input]:min-h-12 [&_input]:rounded-xl [&_input]:border [&_input]:border-[#3B6283] [&_input]:bg-[#3B6283]/25 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-[#E4EAF0] [&_input]:outline-none [&_input]:placeholder:text-[#BBCCEF]/40 [&_input:focus]:border-[#E88211] [&_select]:min-h-12 [&_select]:rounded-xl [&_select]:border [&_select]:border-[#3B6283] [&_select]:bg-[#122849] [&_select]:px-4 [&_select]:text-[#E4EAF0]">
        Cômodo
        <select name="room" defaultValue={device?.room || ROOMS[0]} required>
          {ROOMS.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#E88211]/50 bg-[#E88211]/10 p-3 text-xs leading-relaxed text-[#E4EAF0]"
        >
          {error}
        </p>
      )}
      <button
        className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#E88211] focus-visible:outline-offset-4 bg-[#E88211] text-[#09193B] hover:bg-[#E88211]/85 w-full justify-center"
        disabled={busy}
      >
        {busy
          ? "Salvando…"
          : device
            ? "Salvar alterações"
            : "Adicionar dispositivo"}
        <Icon name="check" size={18} />
      </button>
      {device && (
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#E88211] focus-visible:outline-offset-4 text-[#BBCCEF]/70 hover:text-[#E88211] w-full justify-center"
        >
          <Icon name="trash" size={17} />
          Excluir dispositivo
        </button>
      )}
    </form>
  );
}
