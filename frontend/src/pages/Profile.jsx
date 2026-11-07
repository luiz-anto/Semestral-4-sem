import { useState } from "react";
import Icon from "../components/ui/Icon";
export default function Profile({ user, demo, onSave, onDelete, onLogout }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (!data.password) delete data.password;
    try {
      await onSave(data);
      form.elements.password.value = "";
      setSuccess("Seu perfil foi atualizado.");
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="profile-layout">
      <section className="panel">
        <div className="flex gap-4 items-center mb-8">
          <span className="profile-avatar">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h2 className="text-xl font-semibold">Seu espaço</h2>
            <p className="muted text-sm mt-1">
              {demo ? "Perfil de demonstração" : "Informações da sua conta"}
            </p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <label className="field">
            Nome
            <input
              name="name"
              defaultValue={user.name}
              required
              maxLength={100}
            />
          </label>
          <label className="field">
            E-mail
            <input
              name="email"
              type="email"
              defaultValue={user.email}
              required
            />
          </label>
          <label className="field">
            Nova senha
            <input
              name="password"
              type="password"
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              placeholder="Preencha apenas se quiser alterar"
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm muted" role="status">
              {success}
            </p>
          )}
          <button disabled={busy} className="button button-dark">
            {busy ? "Salvando…" : "Salvar alterações"}
            <Icon name="check" size={18} />
          </button>
        </form>
      </section>
      <section className="panel h-fit">
        <Icon name="shield" size={30} />
        <h2 className="text-xl font-semibold mt-4">Uma casa, a sua conta.</h2>
        <p className="muted text-sm leading-relaxed mt-3">
          Seus dispositivos estão associados ao seu perfil. Só você pode acessar
          e controlar os aparelhos cadastrados na sua conta.
        </p>
        <button
          className="button button-outline w-full justify-center mt-7"
          onClick={onLogout}
        >
          <Icon name="logout" size={18} />
          {demo ? "Sair da demonstração" : "Sair da conta"}
        </button>
        <div className="border-t border-neutral-200 mt-7 pt-6">
          <h3 className="text-sm font-semibold">Excluir conta</h3>
          <p className="muted text-xs leading-relaxed mt-2 mb-3">
            Remove seu perfil e todos os dispositivos associados. Esta ação não
            pode ser desfeita.
          </p>
          <button className="text-link text-sm" onClick={onDelete}>
            Excluir minha conta
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}
