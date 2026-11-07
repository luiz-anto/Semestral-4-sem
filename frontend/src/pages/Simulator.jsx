import { useEffect, useState } from "react";
import { request } from "../services/api";
import { loadDemo } from "../services/demo";
import Icon from "../components/ui/Icon";
export default function Simulator() {
  const id = new URLSearchParams(window.location.search).get("simulator");
  const [device, setDevice] = useState(null),
    [error, setError] = useState(""),
    [ended, setEnded] = useState(false);
  useEffect(() => {
    let stopped = false,
      timer;
    const abort = new AbortController();
    const channel = new BroadcastChannel("smart-home-session-events");
    channel.onmessage = () => {
      stopped = true;
      clearTimeout(timer);
      abort.abort();
      setDevice(null);
      setEnded(true);
    };
    async function refresh() {
      try {
        const session = JSON.parse(
          sessionStorage.getItem("smart-home-session") || "null",
        );
        if (!session)
          throw new Error(
            "Abra esta simulação a partir do painel após entrar na sua conta.",
          );
        const next =
          session.mode === "demo"
            ? loadDemo().find((d) => d.id === id)
            : await request(`/devices/${encodeURIComponent(id)}`, {
                token: session.token,
                signal: abort.signal,
              });
        if (!next) throw new Error("Dispositivo removido ou indisponível.");
        if (!stopped) {
          setDevice(next);
          setError("");
        }
      } catch (e) {
        if (!stopped) {
          setDevice(null);
          setError(
            e.status === 404
              ? "Dispositivo removido ou indisponível."
              : e.status === 401
                ? "Sessão expirada. Entre novamente pelo painel."
                : e.message,
          );
        }
      } finally {
        if (!stopped) timer = setTimeout(refresh, 1000);
      }
    }
    refresh();
    return () => {
      stopped = true;
      clearTimeout(timer);
      abort.abort();
      channel.close();
    };
  }, [id]);
  const on = device?.state.isOn;
  return (
    <main className={`simulator-page ${on ? "device-on" : ""}`}>
      <header className="sim-header">
        <span className="brand">
          <span className="brand-icon">
            <Icon name="home" />
          </span>
          smart home
        </span>
        <span className="tag">Simulação visual</span>
      </header>
      <section className="sim-stage">
        <p className="eyebrow">SEU DISPOSITIVO EM TEMPO REAL</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-3">
          {device?.name || "Simulador de dispositivo"}
        </h1>
        <p className="muted mt-2">{device?.room || "Smart Home"}</p>
        {device ? (
          <>
            <div
              className={`device-scene ${device.type.toLowerCase()}`}
              style={{ "--brightness": (device.state.brightness ?? 100) / 100 }}
            >
              {device.type === "LIGHT" ? (
                <>
                  <div className="lamp-glow" />
                  <svg className="sim-lamp" viewBox="0 0 200 250" fill="none">
                    <path d="M100 5v40" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="bulb-glass"
                      d="M60 105a40 40 0 1 1 80 0c0 26-20 30-22 55H82c-2-25-22-29-22-55Z"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      d="M82 166h36M84 177h32M90 188h20M90 145l-9-37 19 8 19-8-9 37"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="sim-floor" />
                </>
              ) : device.type === "AIR_CONDITIONER" ? (
                <>
                  <div className="ac-unit">
                    <span className="ac-brand">SMART HOME</span>
                    <strong>{on ? `${device.state.temperature}°` : "—"}</strong>
                    <div className="ac-vent" />
                  </div>
                  <div className="airflow">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className={`television ${on ? "tv-on" : ""}`}>
                    <div className="tv-screen">
                      {on ? (
                        <>
                          <span className="tv-channel">
                            CANAL {device.state.channel}
                          </span>
                          <Icon name="tv" size={62} />
                          <p>Smart Home TV</p>
                          <span className="tv-volume">
                            Volume {device.state.volume}%
                          </span>
                        </>
                      ) : (
                        <span className="tv-standby" />
                      )}
                    </div>
                    <div className="tv-base" />
                  </div>
                </>
              )}
            </div>
            <div className="sim-status">
              <span className={`sim-status-dot ${on ? "active" : ""}`} />
              {on ? "Ligado" : "Desligado"}
              {device.type === "LIGHT" && on && (
                <span>· Intensidade {device.state.brightness}%</span>
              )}
              {device.type === "AIR_CONDITIONER" && on && (
                <span>· {device.state.temperature} °C</span>
              )}
            </div>
            <p className="muted text-sm mt-5 max-w-md mx-auto leading-relaxed">
              Altere os controles no painel para acompanhar a representação
              visual nesta aba.
            </p>
          </>
        ) : (
          <p role="status" className="notice mt-10">
            {ended
              ? "A sessão foi encerrada no painel."
              : error || "Conectando ao dispositivo…"}
          </p>
        )}
      </section>
      <footer className="sim-footer">
        Dispositivo simulado · Atualização automática a cada segundo
      </footer>
    </main>
  );
}
