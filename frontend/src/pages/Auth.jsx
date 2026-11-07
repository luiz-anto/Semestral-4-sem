import { useState } from "react";
import Icon from "../components/ui/Icon";
export default function Auth({ onSubmit, onDemo, message }) {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await onSubmit(register, values);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-story">
        <a className="brand" href="#">
          <span className="brand-icon">
            <Icon name="home" size={24} />
          </span>
          smart home<span className="brand-dot">®</span>
        </a>
        <div className="auth-headline">
          <p className="eyebrow">MENOS TOQUES. MAIS CONFORTO.</p>
          <h1>
            Sua casa.
            <br />
            No seu ritmo.
          </h1>
          <p>
            Luzes, clima e entretenimento.
            <br />
            Tudo conectado a você.
          </p>
        </div>
        <div className="house-art" aria-hidden="true">
          <svg viewBox="0 0 440 280" fill="none">
            <path
              d="m40 145 180-110 180 110v100H40Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M70 160 220 68l150 92v85H70ZM220 35v210M40 145h360M70 190h300M140 145v100M300 145v100"
              stroke="currentColor"
              strokeOpacity=".25"
            />
            <rect
              x="182"
              y="177"
              width="76"
              height="68"
              rx="2"
              stroke="currentColor"
            />
            <path d="M100 245v-40h40M300 245v-40h40" stroke="currentColor" />
            <circle cx="220" cy="126" r="20" stroke="currentColor" />
            <path d="M220 114v12l8 5" stroke="currentColor" />
            <circle cx="70" cy="160" r="5" fill="currentColor" />
            <circle cx="370" cy="160" r="5" fill="currentColor" />
          </svg>
          <span>
            <Icon name="shield" size={16} /> Um espaço só seu.
          </span>
        </div>
        <p className="auth-bottom">
          PROJETO SMART HOME <span>CONTROLE COM SIMPLICIDADE</span>
        </p>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <p className="eyebrow">BEM-VINDO À SUA CASA</p>
          <h2>{register ? "Comece por aqui." : "Que bom ter você aqui."}</h2>
          <p className="muted mb-8">
            {register
              ? "Crie sua conta e conecte sua rotina."
              : "Entre para cuidar do seu espaço."}
          </p>
          <div className="auth-tabs">
            <button
              className={!register ? "active" : ""}
              onClick={() => {
                setRegister(false);
                setError("");
              }}
            >
              Entrar
            </button>
            <button
              className={register ? "active" : ""}
              onClick={() => {
                setRegister(true);
                setError("");
              }}
            >
              Criar conta
            </button>
          </div>
          <form onSubmit={submit} className="space-y-5">
            {register && (
              <label className="field">
                Seu nome
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Como podemos chamar você?"
                />
              </label>
            )}
            <label className="field">
              E-mail
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="voce@exemplo.com"
                maxLength={254}
              />
            </label>
            <label className="field">
              Senha
              <input
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
              <p className="form-error" role="alert">
                {error || message}
              </p>
            )}
            <button
              disabled={busy}
              className="button button-dark w-full justify-between"
              type="submit"
            >
              {busy
                ? "Aguarde…"
                : register
                  ? "Criar minha conta"
                  : "Entrar na minha casa"}
              <Icon name="arrow" size={20} />
            </button>
          </form>
          <div className="auth-divider">
            <span>ou conheça primeiro</span>
          </div>
          <button
            className="button button-outline w-full justify-center"
            onClick={onDemo}
          >
            Explorar demonstração <Icon name="arrow" size={18} />
          </button>
          <p className="text-xs muted text-center mt-4 leading-relaxed">
            A demonstração usa dispositivos simulados
            <br />e não altera nenhuma conta.
          </p>
        </div>
      </section>
    </main>
  );
}
