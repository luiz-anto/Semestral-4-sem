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
    <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
      <section className="min-w-0 rounded-3xl border border-[#3B6283]/50 bg-[#122849] p-5 text-[#E4EAF0] sm:p-6">
        <div className="flex gap-4 items-center mb-8">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E88211] text-2xl text-[#09193B]">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h2 className="text-xl font-semibold">Seu espaço</h2>
            <p className="text-[#BBCCEF]/65 text-sm mt-1">
              {demo ? "Perfil de demonstração" : "Informações da sua conta"}
            </p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <label className="flex flex-col gap-2 text-xs text-[#BBCCEF] [&_input]:w-full [&_input]:min-h-12 [&_input]:rounded-xl [&_input]:border [&_input]:border-[#3B6283] [&_input]:bg-[#3B6283]/25 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-[#E4EAF0] [&_input]:outline-none [&_input]:placeholder:text-[#BBCCEF]/40 [&_input:focus]:border-[#E88211] [&_select]:min-h-12 [&_select]:rounded-xl [&_select]:border [&_select]:border-[#3B6283] [&_select]:bg-[#122849] [&_select]:px-4 [&_select]:text-[#E4EAF0]">
            Nome
            <input
              name="name"
              defaultValue={user.name}
              required
              maxLength={100}
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-[#BBCCEF] [&_input]:w-full [&_input]:min-h-12 [&_input]:rounded-xl [&_input]:border [&_input]:border-[#3B6283] [&_input]:bg-[#3B6283]/25 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-[#E4EAF0] [&_input]:outline-none [&_input]:placeholder:text-[#BBCCEF]/40 [&_input:focus]:border-[#E88211] [&_select]:min-h-12 [&_select]:rounded-xl [&_select]:border [&_select]:border-[#3B6283] [&_select]:bg-[#122849] [&_select]:px-4 [&_select]:text-[#E4EAF0]">
            E-mail
            <input
              name="email"
              type="email"
              defaultValue={user.email}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-[#BBCCEF] [&_input]:w-full [&_input]:min-h-12 [&_input]:rounded-xl [&_input]:border [&_input]:border-[#3B6283] [&_input]:bg-[#3B6283]/25 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-[#E4EAF0] [&_input]:outline-none [&_input]:placeholder:text-[#BBCCEF]/40 [&_input:focus]:border-[#E88211] [&_select]:min-h-12 [&_select]:rounded-xl [&_select]:border [&_select]:border-[#3B6283] [&_select]:bg-[#122849] [&_select]:px-4 [&_select]:text-[#E4EAF0]">
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
            <p
              className="rounded-xl border border-[#E88211]/50 bg-[#E88211]/10 p-3 text-xs leading-relaxed text-[#E4EAF0]"
              role="alert"
            >
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-[#BBCCEF]/65" role="status">
              {success}
            </p>
          )}
          <button
            disabled={busy}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#E88211] focus-visible:outline-offset-4 bg-[#E88211] text-[#09193B] hover:bg-[#E88211]/85"
          >
            {busy ? "Salvando…" : "Salvar alterações"}
            <Icon name="check" size={18} />
          </button>
        </form>
      </section>
      <section className="min-w-0 rounded-3xl border border-[#3B6283]/50 bg-[#122849] p-5 text-[#E4EAF0] sm:p-6 h-fit">
        <Icon name="shield" size={30} />
        <h2 className="text-xl font-semibold mt-4">Uma casa, a sua conta.</h2>
        <p className="text-[#BBCCEF]/65 text-sm leading-relaxed mt-3">
          Seus dispositivos estão associados ao seu perfil. Só você pode acessar
          e controlar os aparelhos cadastrados na sua conta.
        </p>
        <button
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#E88211] focus-visible:outline-offset-4 border-[#3B6283] bg-[#3B6283]/10 text-[#BBCCEF] hover:bg-[#3B6283]/30 w-full justify-center mt-7"
          onClick={onLogout}
        >
          <Icon name="logout" size={18} />
          {demo ? "Sair da demonstração" : "Sair da conta"}
        </button>
        <div className="border-t border-[#3B6283]/40 mt-7 pt-6">
          <h3 className="text-sm font-semibold">Excluir conta</h3>
          <p className="text-[#BBCCEF]/65 text-xs leading-relaxed mt-2 mb-3">
            Remove seu perfil e todos os dispositivos associados. Esta ação não
            pode ser desfeita.
          </p>
          <button
            className="inline-flex items-center gap-2 py-2 text-xs text-[#E88211] hover:underline text-sm"
            onClick={onDelete}
          >
            Excluir minha conta
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}
