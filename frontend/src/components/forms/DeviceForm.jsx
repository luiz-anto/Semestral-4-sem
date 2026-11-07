import { useState } from "react";
import Icon from "../ui/Icon";
export default function DeviceForm({ device, rooms, onSave, onDelete }) {
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
      <label className="field">
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
        <label className="field">
          Tipo
          <select name="type" defaultValue="LIGHT">
            <option value="LIGHT">Lâmpada</option>
            <option value="AIR_CONDITIONER">Ar-condicionado</option>
            <option value="TV">Televisão</option>
          </select>
        </label>
      )}
      <label className="field">
        Cômodo
        <input
          name="room"
          defaultValue={device?.room || ""}
          list="room-options"
          maxLength={100}
          placeholder="Ex.: Sala"
        />
        <datalist id="room-options">
          {rooms.map((room) => (
            <option key={room} value={room} />
          ))}
        </datalist>
      </label>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button
        className="button button-dark w-full justify-center"
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
          className="button button-quiet w-full justify-center"
        >
          <Icon name="trash" size={17} />
          Excluir dispositivo
        </button>
      )}
    </form>
  );
}
