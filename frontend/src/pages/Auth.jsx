import { useEffect, useRef, useState } from "react";
import Icon from "../components/ui/Icon";
import Logo from "../components/ui/Logo";
export default function Auth({ onSubmit, onDemo, message }) {
  const [register, setRegister] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const formRef = useRef(null);
  const [completedFields, setCompletedFields] = useState(0);
  function updateProgress() {
    const fields = Array.from(
      formRef.current?.querySelectorAll("input[required]") ?? [],
    );
    setCompletedFields(
      fields.filter((field) => field.value.trim().length > 0).length,
    );
  }
  useEffect(() => {
    updateProgress();
  }, [register]);
  const totalFields = register ? 3 : 2;
  const progress = Math.round((completedFields / totalFields) * 100);
  const progressWidth =
    completedFields === 0
      ? "w-0"
      : completedFields === totalFields
        ? "w-full"
        : register
          ? completedFields === 1
            ? "w-1/3"
            : "w-2/3"
          : "w-1/2";
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSubmit(
        register,
        Object.fromEntries(new FormData(event.currentTarget)),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#09193B] px-6 py-7 text-[#BBCCEF] font-['Tenor_Sans',sans-serif] lg:grid lg:grid-cols-2 lg:gap-20 lg:px-[8vw] lg:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-52 top-0 -z-10 h-[700px] w-[600px] -rotate-12 rounded-full border-r-[35px] border-[#3B6283]/25 blur-xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-60 -left-40 -z-10 h-[550px] w-[900px] -rotate-[25deg] rounded-full border-t-[35px] border-[#3B6283]/20 blur-xl"
      />
      <section className="mx-auto flex w-full max-w-lg flex-col items-center justify-center text-center lg:items-start lg:text-left">
        <a href="#" className="hidden items-center gap-3 text-xl lg:flex">
          <Logo />
          KiloW
        </a>
        <div className="flex flex-col items-center pt-8 pb-8 lg:items-start lg:py-16">
          <Logo size="large" />
          <h1 className="mt-2 text-5xl tracking-tight sm:text-6xl lg:text-7xl">
            KiloW
          </h1>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#BBCCEF]/75 lg:max-w-sm lg:text-base">
            Assuma o controle total da energia da sua casa. Monitore o consumo
            em tempo real e reduza sua conta de luz.
          </p>
        </div>
        <div className="hidden w-full border-t border-[#3B6283]/50 pt-6 lg:block">
          <p className="text-[10px] tracking-[.2em] text-[#BBCCEF]/50">
            MAIS CONTROLE. MAIS CONFORTO.
          </p>
          <p className="mt-3 text-sm text-[#BBCCEF]/70">
            Pequenos ajustes fazem toda a diferença.
          </p>
        </div>
      </section>
      <section className="mx-auto flex w-full max-w-md flex-col justify-center pb-8 lg:py-12">
        <div className="mb-6 flex items-center justify-between">
          <span className="rounded-full border border-[#3B6283] bg-[#3B6283]/15 px-3 py-1 text-[10px] text-[#BBCCEF]">
            {register ? "02 · Sua conta" : "01 · Bem-vindo"}
          </span>
          <span className="text-[10px] tracking-widest text-[#BBCCEF]/50">
            SEU ESPAÇO
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Preenchimento do formulário"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={`${completedFields} de ${totalFields} campos preenchidos`}
          className="mb-8 h-1 w-full overflow-hidden rounded-full bg-[#3B6283]"
        >
          <div
            className={`h-full rounded-full bg-[#E88211] transition-[width] duration-300 ease-out motion-reduce:transition-none ${progressWidth}`}
          />
        </div>
        <h2 className="text-2xl tracking-tight sm:text-3xl">
          {register ? "Comece sua conexão." : "Entre na sua casa."}
        </h2>
        <p className="mt-3 mb-7 text-xs leading-relaxed text-[#BBCCEF]/60">
          {register
            ? "Crie seu perfil para personalizar cada detalhe."
            : "Tudo do seu jeito, a poucos toques de distância."}
        </p>
        <div className="mb-7 flex rounded-full border border-[#3B6283] bg-[#3B6283]/15 p-1">
          {[
            {
              value: false,
              label: "Entrar",
            },
            {
              value: true,
              label: "Criar conta",
            },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={register === item.value}
              onClick={() => {
                setRegister(item.value);
                setError("");
              }}
              className="min-h-11 flex-1 rounded-full px-4 text-sm transition text-[#BBCCEF] aria-pressed:bg-[#BBCCEF] aria-pressed:text-[#09193B] focus-visible:outline-2 focus-visible:outline-[#E88211]"
            >
              {item.label}
            </button>
          ))}
        </div>
        <form
          ref={formRef}
          onInput={updateProgress}
          onChange={updateProgress}
          onSubmit={submit}
          className="space-y-5"
        >
          {register && (
            <label className="flex flex-col gap-2 text-xs text-[#BBCCEF] [&_input]:w-full [&_input]:min-h-12 [&_input]:rounded-xl [&_input]:border [&_input]:border-[#3B6283] [&_input]:bg-[#3B6283]/25 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-[#E4EAF0] [&_input]:outline-none [&_input]:placeholder:text-[#BBCCEF]/40 [&_input:focus]:border-[#E88211] [&_select]:min-h-12 [&_select]:rounded-xl [&_select]:border [&_select]:border-[#3B6283] [&_select]:bg-[#122849] [&_select]:px-4 [&_select]:text-[#E4EAF0]">
              Seu nome
              <input
                key="name"
                name="name"
                autoComplete="name"
                required
                maxLength={100}
                placeholder="Como podemos chamar você?"
              />
            </label>
          )}
          <label className="flex flex-col gap-2 text-xs text-[#BBCCEF] [&_input]:w-full [&_input]:min-h-12 [&_input]:rounded-xl [&_input]:border [&_input]:border-[#3B6283] [&_input]:bg-[#3B6283]/25 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-[#E4EAF0] [&_input]:outline-none [&_input]:placeholder:text-[#BBCCEF]/40 [&_input:focus]:border-[#E88211] [&_select]:min-h-12 [&_select]:rounded-xl [&_select]:border [&_select]:border-[#3B6283] [&_select]:bg-[#122849] [&_select]:px-4 [&_select]:text-[#E4EAF0]">
            E-mail
            <input
              key="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="voce@exemplo.com"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-[#BBCCEF] [&_input]:w-full [&_input]:min-h-12 [&_input]:rounded-xl [&_input]:border [&_input]:border-[#3B6283] [&_input]:bg-[#3B6283]/25 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-[#E4EAF0] [&_input]:outline-none [&_input]:placeholder:text-[#BBCCEF]/40 [&_input:focus]:border-[#E88211] [&_select]:min-h-12 [&_select]:rounded-xl [&_select]:border [&_select]:border-[#3B6283] [&_select]:bg-[#122849] [&_select]:px-4 [&_select]:text-[#E4EAF0]">
            Senha
            <input
              key="password"
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              required
              minLength={register ? 8 : 1}
              maxLength={72}
              placeholder={register ? "Pelo menos 8 caracteres" : "Sua senha"}
            />
          </label>
          {(error || message) && (
            <p
              role="alert"
              className="rounded-xl border border-[#E88211]/50 bg-[#E88211]/10 p-3 text-xs leading-relaxed text-[#E4EAF0]"
            >
              {error || message}
            </p>
          )}
          <button
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#E88211] focus-visible:outline-offset-4 bg-[#E88211] text-[#09193B] hover:bg-[#E88211]/85 w-full justify-between mt-4"
            disabled={busy}
          >
            {busy ? "Aguarde…" : register ? "Criar minha conta" : "Entrar"}
            <Icon name="arrow" size={19} />
          </button>
        </form>
        <button
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#E88211] focus-visible:outline-offset-4 border-[#3B6283] bg-[#3B6283]/10 text-[#BBCCEF] hover:bg-[#3B6283]/30 w-full justify-center mt-4 rounded-full"
          onClick={onDemo}
        >
          Explorar demonstração
        </button>
      </section>
    </main>
  );
}
