import Logo from "../components/ui/Logo";
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
    <main
      className={`flex min-h-dvh flex-col bg-[#09193B] text-[#E4EAF0] font-['Tenor_Sans',sans-serif] group/sim ${on ? "" : ""}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-[#3B6283]/40 px-5 py-5 sm:px-10">
        <span className="inline-flex items-center gap-3 text-2xl tracking-tight text-[#BBCCEF] whitespace-nowrap">
          <Logo />
          KiloW
        </span>
        <span className="rounded-full border border-[#3B6283] bg-[#3B6283]/15 px-3 py-1 text-[10px] text-[#BBCCEF]">
          Simulação visual
        </span>
      </header>
      <section className="flex-1 px-5 py-10 text-center">
        <p className="text-[10px] uppercase tracking-[.18em] text-[#BBCCEF]/60">
          SEU DISPOSITIVO EM TEMPO REAL
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mt-3">
          {device?.name || "Simulador de dispositivo"}
        </h1>
        <p className="text-[#BBCCEF]/65 mt-2">{device?.room || "KiloW"}</p>
        {device ? (
          <>
            <div
              className={`relative mx-auto my-6 flex h-80 w-full max-w-xl items-center justify-center overflow-hidden rounded-3xl border border-[#3B6283]/40 bg-[#122849] ${device.type.toLowerCase()}`}
            >
              {device.type === "LIGHT" ? (
                <>
                  <svg
                    aria-hidden="true"
                    className="absolute h-64 w-64 blur-3xl"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className="fill-[#E88211]"
                      fillOpacity={
                        on ? (device.state.brightness ?? 100) / 100 : 0
                      }
                    />
                  </svg>
                  <svg
                    className="relative z-10 h-64 text-[#BBCCEF]"
                    viewBox="0 0 200 250"
                    fill="none"
                  >
                    <path d="M100 5v40" stroke="currentColor" strokeWidth="4" />
                    <path
                      className={
                        on && device.state.brightness > 0
                          ? "fill-[#E88211]"
                          : "fill-[#3B6283]"
                      }
                      fillOpacity={
                        on ? Math.max(0.15, device.state.brightness / 100) : 1
                      }
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
                  <div className="absolute bottom-5 h-4 w-48 rounded-full bg-[#09193B] blur-md" />
                </>
              ) : device.type === "AIR_CONDITIONER" ? (
                <>
                  <div className="absolute top-16 left-[12%] flex h-28 w-[76%] items-center justify-between rounded-2xl border border-[#BBCCEF]/50 bg-[#E4EAF0] p-6 text-[#3B6283] [&_strong]:text-2xl">
                    <span className="text-[9px] tracking-widest">KiloW</span>
                    <strong>{on ? `${device.state.temperature}°` : "—"}</strong>
                    <div className="absolute bottom-3 left-[7%] h-3 w-[86%] border-y-2 border-[#3B6283]" />
                  </div>
                  <div
                    className={`absolute top-48 flex h-28 w-3/5 justify-between [&>span]:h-20 [&>span]:w-0.5 [&>span]:rounded-full [&>span]:bg-[#BBCCEF] ${on ? "animate-pulse motion-reduce:animate-none" : "invisible"}`}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className={`relative w-4/5 ${on ? "" : ""}`}>
                    <div
                      className={`relative flex h-48 flex-col items-center justify-center gap-3 rounded-xl border-8 border-[#1C1D1F] text-[#BBCCEF] sm:h-56 ${on ? "bg-[#3B6283]" : "bg-[#1C1D1F]"}`}
                    >
                      {on ? (
                        <>
                          <span className="absolute top-3 left-3 text-[10px] tracking-widest">
                            CANAL {device.state.channel}
                          </span>
                          <Icon name="tv" size={62} />
                          <p>KiloW TV</p>
                          <span className="absolute bottom-3 right-3 text-[10px]">
                            Volume {device.state.volume}%
                          </span>
                        </>
                      ) : (
                        <span className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-[#E88211]" />
                      )}
                    </div>
                    <div className="mx-auto h-7 w-1/4 border-b-4 border-[#3B6283] after:mx-auto after:block after:h-full after:w-1.5 after:bg-[#3B6283]" />
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-[#BBCCEF]">
              <span
                className={`h-2 w-2 rounded-full ${on ? "bg-[#E88211]" : "bg-[#3B6283]"}`}
              />
              {on ? "Ligado" : "Desligado"}
              {device.type === "LIGHT" && on && (
                <span>· Intensidade {device.state.brightness}%</span>
              )}
              {device.type === "AIR_CONDITIONER" && on && (
                <span>· {device.state.temperature} °C</span>
              )}
            </div>
            <p className="text-[#BBCCEF]/65 text-sm mt-5 max-w-md mx-auto leading-relaxed">
              Altere os controles no painel para acompanhar a representação
              visual nesta aba.
            </p>
          </>
        ) : (
          <p
            role="status"
            className="flex gap-3 rounded-xl border border-[#3B6283] bg-[#3B6283]/15 p-4 text-sm leading-relaxed text-[#BBCCEF] mt-10"
          >
            {ended
              ? "A sessão foi encerrada no painel."
              : error || "Conectando ao dispositivo…"}
          </p>
        )}
      </section>
      <footer className="p-5 text-center text-[10px] text-[#BBCCEF]/50">
        Dispositivo simulado · Atualização automática a cada segundo
      </footer>
    </main>
  );
}
