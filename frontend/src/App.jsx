import Logo from "./components/ui/Logo";
import { useEffect, useRef, useState } from "react";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import DeviceCard from "./components/devices/DeviceCard";
import DeviceControls from "./components/devices/DeviceControls";
import DeviceForm from "./components/forms/DeviceForm";
import Icon from "./components/ui/Icon";
import Modal from "./components/ui/Modal";
import { request } from "./services/api";
import { demoUser, defaultState, loadDemo, saveDemo } from "./services/demo";
const SESSION = "smart-home-session";
const navItems = [
  {
    id: "home",
    label: "Visão geral",
    icon: "grid",
  },
  {
    id: "rooms",
    label: "Cômodos",
    icon: "rooms",
  },
  {
    id: "chat",
    label: "Chatbot",
    icon: "chat",
  },
  {
    id: "profile",
    label: "Meu perfil",
    icon: "user",
  },
];
function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION)) || null;
  } catch {
    return null;
  }
}
export default function App() {
  const [session, setSession] = useState(readSession);
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [page, setPage] = useState("home");
  const [room, setRoom] = useState("Todos");
  const [loading, setLoading] = useState(Boolean(session));
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState({});
  const [notice, setNotice] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [modal, setModal] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const controlsRef = useRef(null);
  const lock = useRef(new Set());
  const demo = session?.mode === "demo";
  function storeSession(next) {
    if (next) sessionStorage.setItem(SESSION, JSON.stringify(next));
    else sessionStorage.removeItem(SESSION);
    setSession(next);
  }
  function clearSession(message = "") {
    const channel = new BroadcastChannel("smart-home-session-events");
    channel.postMessage("logout");
    channel.close();
    storeSession(null);
    setUser(null);
    setDevices([]);
    setModal(null);
    setPage("home");
    setRoom("Todos");
    setAuthMessage(message);
    setLoading(false);
  }
  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");
    (async () => {
      try {
        if (session.mode === "demo") {
          if (active) {
            setUser(demoUser);
            setDevices(loadDemo());
          }
          return;
        }
        const profile = await request("/auth/me", {
          token: session.token,
          signal: controller.signal,
        });
        const list = await request("/devices", {
          token: session.token,
          signal: controller.signal,
        });
        if (active) {
          setUser(profile);
          setDevices(list);
        }
      } catch (error) {
        if (!active || error.name === "AbortError") return;
        if (error.status === 401)
          clearSession("Sua sessão expirou. Entre novamente.");
        else setLoadError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [session]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  async function authenticate(register, values) {
    setAuthMessage("");
    if (register)
      await request("/auth/register", {
        method: "POST",
        body: values,
      });
    const auth = await request("/auth/login", {
      method: "POST",
      body: {
        email: values.email,
        password: values.password,
      },
    });
    storeSession({
      mode: "api",
      token: auth.access_token,
    });
  }
  function handleError(error) {
    if (error.status === 401)
      clearSession("Sua sessão expirou. Entre novamente.");
    else setNotice(error.message);
  }
  function updateDevices(fn) {
    setDevices((previous) => {
      const next = fn(previous);
      if (demo) saveDemo(next);
      return next;
    });
  }
  async function changeState(device, patch) {
    if (lock.current.has(device.id)) return;
    lock.current.add(device.id);
    setBusy((b) => ({
      ...b,
      [device.id]: true,
    }));
    try {
      const updated = demo
        ? {
            ...device,
            state: {
              ...device.state,
              ...patch,
            },
          }
        : await request(`/devices/${device.id}/state`, {
            token: session.token,
            method: "PATCH",
            body: patch,
          });
      updateDevices((items) =>
        items.map((d) => (d.id === device.id ? updated : d)),
      );
      setNotice("Dispositivo atualizado.");
    } catch (error) {
      handleError(error);
    } finally {
      lock.current.delete(device.id);
      setBusy((b) => ({
        ...b,
        [device.id]: false,
      }));
    }
  }
  function openSimulation(device, tab) {
    const target = tab || window.open("about:blank", "_blank");
    if (!target) {
      setNotice(
        "O navegador bloqueou a aba. Use Abrir simulação nos controles do dispositivo.",
      );
      return;
    }
    target.location.replace(
      `${window.location.origin}${window.location.pathname}?simulator=${encodeURIComponent(device.id)}`,
    );
  }
  async function saveDevice(data) {
    const simulationTab = !modal.device
      ? window.open("about:blank", "_blank")
      : null;
    try {
      let updated;
      if (demo)
        updated = modal.device
          ? {
              ...modal.device,
              ...data,
            }
          : {
              id: crypto.randomUUID(),
              ...data,
              state: defaultState(data.type),
            };
      else
        updated = await request(
          modal.device ? `/devices/${modal.device.id}` : "/devices",
          {
            token: session.token,
            method: modal.device ? "PATCH" : "POST",
            body: data,
          },
        );
      updateDevices((items) =>
        modal.device
          ? items.map((d) => (d.id === updated.id ? updated : d))
          : [...items, updated],
      );
      if (!modal.device) {
        if (simulationTab) openSimulation(updated, simulationTab);
        else
          setNotice(
            "Dispositivo salvo. Abra a simulação pelos controles; o navegador bloqueou a nova aba.",
          );
      }
      setSelectedId(updated.id);
      setRoom("Todos");
      setModal(null);
      if (modal.device || simulationTab) setNotice("Dispositivo salvo.");
    } catch (error) {
      if (error.status === 401)
        clearSession("Sua sessão expirou. Entre novamente.");
      simulationTab?.close();
      throw error;
    }
  }
  async function saveProfile(data) {
    if (demo) {
      setUser((previous) => ({
        ...previous,
        name: data.name,
        email: data.email,
      }));
      return;
    }
    try {
      const profile = await request("/users/me", {
        token: session.token,
        method: "PATCH",
        body: data,
      });
      setUser(profile);
    } catch (error) {
      if (error.status === 401)
        clearSession("Sua sessão expirou. Entre novamente.");
      throw error;
    }
  }
  async function confirmDelete() {
    setBusy((b) => ({
      ...b,
      delete: true,
    }));
    try {
      if (modal.type === "delete-account") {
        if (!demo)
          await request("/users/me", {
            token: session.token,
            method: "DELETE",
          });
        clearSession("Conta excluída.");
      } else {
        const id = modal.device.id;
        if (!demo)
          await request(`/devices/${id}`, {
            token: session.token,
            method: "DELETE",
          });
        updateDevices((items) => items.filter((d) => d.id !== id));
        setRoom("Todos");
        setModal(null);
        setNotice("Dispositivo excluído.");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setBusy((b) => ({
        ...b,
        delete: false,
      }));
    }
  }
  async function logout() {
    // Descartar o token é o logout previsto pela API.
    clearSession();
  }
  const rooms = [...new Set(devices.map((d) => d.room || "Sem cômodo"))].sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );
  const visible =
    room === "Todos"
      ? devices
      : devices.filter((d) => (d.room || "Sem cômodo") === room);
  const selected = visible.find((d) => d.id === selectedId) || visible[0];
  const active = devices.filter((d) => d.state.isOn).length;
  function selectDevice(device) {
    setSelectedId(device.id);
    if (window.innerWidth < 1200)
      requestAnimationFrame(() =>
        controlsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      );
  }
  if (!session)
    return (
      <Auth
        onSubmit={authenticate}
        onDemo={() => {
          setAuthMessage("");
          storeSession({
            mode: "demo",
          });
        }}
        message={authMessage}
      />
    );
  if (loading)
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-[#09193B] text-[#E4EAF0] font-['Tenor_Sans',sans-serif]">
        <Logo />
        <h1 className="text-xl font-semibold mt-5">Preparando sua casa…</h1>
        <p className="text-[#BBCCEF]/65 mt-2">Um instante.</p>
      </main>
    );
  if (loadError)
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-[#09193B] text-[#E4EAF0] font-['Tenor_Sans',sans-serif] px-6">
        <Icon name="info" size={32} />
        <h1 className="text-xl font-semibold mt-5">
          Sua casa está fora de alcance.
        </h1>
        <p role="alert" className="text-[#BBCCEF]/65 mt-3 max-w-md text-center">
          {loadError}
        </p>
        <button
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#E88211] focus-visible:outline-offset-4 bg-[#E88211] text-[#09193B] hover:bg-[#E88211]/85 mt-6"
          onClick={() =>
            setSession({
              ...session,
            })
          }
        >
          Tentar novamente
        </button>
        <button
          className="inline-flex items-center gap-2 py-2 text-xs text-[#E88211] hover:underline mt-4"
          onClick={() => clearSession()}
        >
          Voltar para entrar
        </button>
      </main>
    );
  if (!user) return null;
  return (
    <div className="min-h-dvh bg-[#09193B] text-[#E4EAF0] font-['Tenor_Sans',sans-serif] lg:grid lg:grid-cols-[230px_minmax(0,1fr)] selection:bg-[#E88211] selection:text-[#09193B] [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-50 [&_button]:transition [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-[#E88211] [&_button:focus-visible]:outline-offset-4">
      <a
        href="#main-content"
        className="fixed -top-24 left-4 z-50 rounded-lg bg-[#E88211] p-4 text-[#09193B] focus:top-4"
      >
        Ir para o conteúdo
      </a>
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col border-r border-[#BBCCEF]/10 bg-[#07132E] px-6 py-8">
        <a
          className="inline-flex items-center gap-3 text-2xl tracking-tight text-[#BBCCEF] whitespace-nowrap"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("home");
          }}
        >
          <Logo />
          KiloW<span className="hidden">®</span>
        </a>
        <div className="mt-12 flex gap-3 items-center rounded-2xl border border-[#3B6283]/60 bg-[#3B6283]/15 p-4 [&_strong]:block [&_strong]:text-sm [&_span]:text-[10px] [&_span]:text-[#BBCCEF]/70">
          <span className="text-[#E88211]">
            <Icon name="home" size={18} />
          </span>
          <div>
            <strong>Minha casa</strong>
            <span>
              {demo ? "Ambiente de demonstração" : "Seu espaço conectado"}
            </span>
          </div>
        </div>
        <p className="mt-10 mb-4 text-[9px] tracking-[.2em] text-[#BBCCEF]/45">
          SEU DIA A DIA
        </p>
        <nav aria-label="Menu principal">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm text-[#BBCCEF]/70 hover:bg-[#3B6283]/30 aria-[current=page]:bg-[#E88211] aria-[current=page]:text-[#09193B] ${page === item.id ? "" : ""}`}
              aria-current={page === item.id ? "page" : undefined}
              onClick={() => {
                setPage(item.id);
                setRoom("Todos");
              }}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
              {page === item.id && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-current" />
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-10">
          <div className="rounded-2xl bg-[#3B6283]/15 border border-[#3B6283]/20 p-5 text-[#BBCCEF]/60 [&_strong]:mt-4 [&_strong]:block [&_strong]:text-sm [&_strong]:text-[#BBCCEF] [&_p]:mt-2 [&_p]:text-xs [&_p]:leading-relaxed">
            <Icon name="shield" size={23} />
            <strong>Conectada a você.</strong>
            <p>
              Pequenos controles.
              <br />
              Uma rotina mais simples.
            </p>
          </div>
          <button
            className="mt-6 pt-5 border-t border-[#BBCCEF]/10 flex items-center gap-3 text-left w-full [&>span:nth-child(2)]:min-w-0 [&>span:nth-child(2)]:flex-1 [&_strong]:block [&_strong]:truncate [&_strong]:text-sm [&_small]:text-[10px] [&_small]:text-[#BBCCEF]/50"
            onClick={() => setPage("profile")}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#3B6283] bg-[#3B6283]/35 text-sm text-[#BBCCEF]">
              {user.name[0].toUpperCase()}
            </span>
            <span>
              <strong>{user.name}</strong>
              <small>{demo ? "Demonstração" : "Minha conta"}</small>
            </span>
            <Icon name="chevron" size={17} />
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex h-20 items-center justify-between border-b border-[#BBCCEF]/10 px-5 sm:px-9">
          <a
            href="#"
            className="flex items-center gap-2 text-xl text-[#BBCCEF] lg:hidden"
            onClick={(e) => {
              e.preventDefault();
              setPage("home");
            }}
          >
            <Logo />
            <strong>KiloW</strong>
          </a>
          <p className="hidden text-xs text-[#BBCCEF]/60 lg:block [&_span]:mx-4 [&_span]:text-[#3B6283]">
            Minha casa <span>/</span>{" "}
            {navItems.find((n) => n.id === page)?.label}
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 text-[10px] text-[#BBCCEF]/60 [&>span]:h-1.5 [&>span]:w-1.5 [&>span]:rounded-full [&>span]:bg-[#E88211]">
              <span />
              {demo ? "Modo demonstração" : "API conectada"}
            </span>
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#3B6283] bg-[#3B6283]/35 text-sm text-[#BBCCEF]"
              aria-label="Abrir meu perfil"
              onClick={() => setPage("profile")}
            >
              {user.name[0].toUpperCase()}
            </button>
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto max-w-[1500px] px-5 py-6 pb-32 sm:px-9 lg:pb-10 lg:py-9"
        >
          {demo && (
            <div className="mb-7 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#3B6283]/50 bg-[#3B6283]/15 px-4 py-2.5 text-[10px] text-[#BBCCEF]/70 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>button]:flex [&>button]:items-center [&>button]:gap-2 [&>button]:text-[#E88211]">
              <span>
                <Icon name="info" size={16} />
                Demonstração · alterações apenas neste navegador
              </span>
              <button onClick={() => clearSession()}>
                Entrar na minha conta
                <Icon name="arrow" size={15} />
              </button>
            </div>
          )}
          <section className="mb-8 flex flex-wrap items-center justify-between gap-6 [&_h1]:mt-3 [&_h1]:text-3xl [&_h1]:leading-tight [&_h1]:tracking-tight sm:[&_h1]:text-4xl [&_h1_span]:text-[#BBCCEF] [&_p]:text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-[.18em] text-[#BBCCEF]/60">
                {new Intl.DateTimeFormat("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })
                  .format(new Date())
                  .toUpperCase()}
              </p>
              <h1>
                {page === "home" ? (
                  <>
                    Sua casa, <span>sob controle.</span>
                  </>
                ) : page === "rooms" ? (
                  "Cada espaço, do seu jeito."
                ) : page === "chat" ? (
                  "Sua casa, em uma conversa."
                ) : (
                  "Tudo sobre você."
                )}
              </h1>
              <p className="text-[#BBCCEF]/65 mt-3">
                {page === "home"
                  ? `Olá, ${user.name.split(" ")[0]}. Deixe tudo do jeito que você gosta.`
                  : page === "rooms"
                    ? "Encontre e controle os dispositivos de cada cômodo."
                    : page === "chat"
                      ? "Um novo jeito de interagir com seu espaço. Em breve."
                      : "Cuide do seu perfil e das suas preferências."}
              </p>
            </div>
            {(page === "home" || page === "rooms") && (
              <button
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#E88211] focus-visible:outline-offset-4 bg-[#E88211] text-[#09193B] hover:bg-[#E88211]/85 text-xs"
                onClick={() =>
                  setModal({
                    type: "device",
                  })
                }
              >
                <Icon name="plus" size={19} />
                <span>Adicionar dispositivo</span>
              </button>
            )}
          </section>
          {(page === "home" || page === "rooms") && (
            <>
              {page === "home" && (
                <section className="relative mb-6 flex min-h-44 items-center justify-between gap-4 overflow-hidden rounded-3xl bg-[#BBCCEF] p-6 text-[#09193B] sm:min-h-52 sm:p-8">
                  <div className="relative z-10">
                    <p className="text-[9px] uppercase tracking-[.18em] text-[#3B6283]">
                      BEM-VINDO AO SEU ESPAÇO
                    </p>
                    <h2 className="mt-3 text-2xl leading-tight tracking-tight sm:text-4xl">
                      Você no controle.
                      <br />
                      Sua casa no seu ritmo.
                    </h2>
                    <p className="mt-4 text-xs text-[#3B6283]">
                      {active} de {devices.length} dispositivos ligados agora.
                    </p>
                  </div>
                  <div className="hidden shrink-0 sm:block">
                    <Logo size="large" />
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute -right-12 -top-12 h-64 w-64 rounded-full border-[30px] border-[#3B6283]/10"
                  />
                </section>
              )}
              <div className="mb-9 grid grid-cols-3 overflow-hidden rounded-2xl border border-[#3B6283]/40 bg-[#3B6283]/15">
                <div className="flex flex-wrap items-center gap-3 p-4 sm:p-6 border-r border-[#3B6283]/40 last:border-0 [&_strong]:text-2xl [&_strong]:text-[#E4EAF0] [&_p]:mt-1 [&_p]:text-[10px] [&_p]:text-[#BBCCEF]/60">
                  <span className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3B6283]/30 text-[#BBCCEF]">
                    <Icon name="grid" />
                  </span>
                  <div>
                    <strong>{String(devices.length).padStart(2, "0")}</strong>
                    <p>Dispositivos</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 p-4 sm:p-6 border-r border-[#3B6283]/40 last:border-0 [&_strong]:text-2xl [&_strong]:text-[#E4EAF0] [&_p]:mt-1 [&_p]:text-[10px] [&_p]:text-[#BBCCEF]/60">
                  <span className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3B6283]/30 text-[#BBCCEF]">
                    <Icon name="power" />
                  </span>
                  <div>
                    <strong>{String(active).padStart(2, "0")}</strong>
                    <p>Ligados agora</p>
                  </div>
                  <span className="hidden xl:block ml-auto rounded-full border border-[#3B6283] px-2 py-1 text-[9px] text-[#BBCCEF]/70">
                    {devices.length
                      ? Math.round((active / devices.length) * 100)
                      : 0}
                    % ativos
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 p-4 sm:p-6 border-r border-[#3B6283]/40 last:border-0 [&_strong]:text-2xl [&_strong]:text-[#E4EAF0] [&_p]:mt-1 [&_p]:text-[10px] [&_p]:text-[#BBCCEF]/60">
                  <span className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3B6283]/30 text-[#BBCCEF]">
                    <Icon name="rooms" />
                  </span>
                  <div>
                    <strong>
                      {String(
                        rooms.filter((r) => r !== "Sem cômodo").length,
                      ).padStart(2, "0")}
                    </strong>
                    <p>Cômodos</p>
                  </div>
                </div>
              </div>
              <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
                <section className="min-w-0">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-3 text-xl text-[#E4EAF0] [&>span]:rounded-full [&>span]:bg-[#3B6283]/30 [&>span]:px-2.5 [&>span]:py-1 [&>span]:text-xs [&>span]:text-[#BBCCEF]">
                      {page === "rooms" ? "Seus cômodos" : "Seus dispositivos"}
                      <span>{visible.length}</span>
                    </h2>
                    <span className="text-xs text-[#BBCCEF]/65 hidden sm:block">
                      Uma casa mais simples.
                    </span>
                  </div>
                  <div
                    className="mb-5 flex gap-2 overflow-x-auto pb-2 [&>button]:inline-flex [&>button]:min-h-10 [&>button]:shrink-0 [&>button]:items-center [&>button]:gap-2 [&>button]:rounded-full [&>button]:border [&>button]:border-[#3B6283] [&>button]:bg-[#3B6283]/20 [&>button]:px-5 [&>button]:text-xs [&>button]:text-[#BBCCEF] [&>button[aria-pressed=true]]:border-[#E88211] [&>button[aria-pressed=true]]:bg-[#E88211] [&>button[aria-pressed=true]]:text-[#09193B]"
                    role="group"
                    aria-label="Filtrar por cômodo"
                  >
                    {["Todos", ...rooms].map((name) => (
                      <button
                        key={name}
                        aria-pressed={room === name}
                        className={room === name ? "" : ""}
                        onClick={() => setRoom(name)}
                      >
                        {name === "Todos" && <Icon name="grid" size={15} />}{" "}
                        {name}
                      </button>
                    ))}
                  </div>
                  {visible.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-5">
                      {visible.map((device) => (
                        <DeviceCard
                          key={device.id}
                          device={device}
                          selected={selected?.id === device.id}
                          busy={busy[device.id]}
                          onSelect={() => selectDevice(device)}
                          onToggle={() =>
                            changeState(device, {
                              isOn: !device.state.isOn,
                            })
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-[#3B6283] bg-[#3B6283]/10 px-5 py-12 text-center [&_h3]:text-xl [&_p]:mt-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-[#BBCCEF]/70">
                      <span className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#3B6283]/30 text-[#E88211]">
                        <Icon name="home" size={36} />
                      </span>
                      <h3>Uma casa cheia de possibilidades.</h3>
                      <p>
                        Adicione seu primeiro dispositivo e comece
                        <br className="hidden sm:block" /> a controlar sua
                        rotina por aqui.
                      </p>
                      <button
                        className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#E88211] focus-visible:outline-offset-4 bg-[#E88211] text-[#09193B] hover:bg-[#E88211]/85 mt-5"
                        onClick={() =>
                          setModal({
                            type: "device",
                          })
                        }
                      >
                        <Icon name="plus" size={18} />
                        Adicionar dispositivo
                      </button>
                    </div>
                  )}
                  <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#3B6283]/25 bg-[#3B6283]/10 p-5 [&_h3]:text-sm [&_p]:mt-2 [&_p]:text-xs [&_p]:leading-relaxed [&_p]:text-[#BBCCEF]/60 [&>svg]:ml-auto [&>svg]:shrink-0">
                    <span className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3B6283]/30 text-[#BBCCEF]">
                      <Icon name="home" size={20} />
                    </span>
                    <div>
                      <h3>O conforto está nos detalhes.</h3>
                      <p>
                        Ajuste a luz, encontre a temperatura ideal e aproveite
                        seu espaço.
                      </p>
                    </div>
                    <Icon name="arrow" size={23} />
                  </div>
                </section>
                <aside className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                  <div ref={controlsRef} className="scroll-mt-6">
                    {selected && (
                      <DeviceControls
                        key={selected.id}
                        device={selected}
                        busy={busy[selected.id]}
                        onSimulate={() => openSimulation(selected)}
                        onApply={(patch) => changeState(selected, patch)}
                        onEdit={() =>
                          setModal({
                            type: "device",
                            device: selected,
                          })
                        }
                      />
                    )}
                  </div>
                  <section className="min-w-0 rounded-3xl border border-[#3B6283]/50 bg-[#122849] p-5 text-[#E4EAF0] sm:p-6">
                    <Icon name="chat" size={28} />
                    <h3 className="text-xl font-semibold mt-4">
                      Vamos conversar?
                    </h3>
                    <p className="text-[#BBCCEF]/65 text-sm mt-2">
                      Seu assistente para a casa está chegando.
                    </p>
                    <button
                      className="inline-flex items-center gap-2 py-2 text-xs text-[#E88211] hover:underline mt-4"
                      onClick={() => setPage("chat")}
                    >
                      Conhecer o assistente <Icon name="arrow" size={18} />
                    </button>
                  </section>
                </aside>
              </div>
            </>
          )}
          {page === "chat" && <Chat />}
          {page === "profile" && (
            <Profile
              user={user}
              demo={demo}
              onSave={saveProfile}
              onDelete={() =>
                setModal({
                  type: "delete-account",
                })
              }
              onLogout={logout}
            />
          )}
          <footer className="mt-10 border-t border-[#3B6283]/30 pt-6 text-center text-xs text-[#BBCCEF]/65">
            Vitor paga a pensão dos seus 7 filhos
          </footer>
        </main>
      </div>
      <nav
        className="fixed bottom-4 left-5 right-5 z-30 mx-auto flex max-w-md items-center justify-around rounded-full border border-[#3B6283]/60 bg-[#BBCCEF]/95 px-3 py-2 shadow-xl backdrop-blur-xl lg:hidden [&_button]:flex [&_button]:min-h-12 [&_button]:min-w-14 [&_button]:flex-col [&_button]:items-center [&_button]:justify-center [&_button]:gap-1 [&_button]:rounded-full [&_button]:text-[#3B6283] [&_button_span]:text-[8px] [&_button[aria-current=page]]:bg-[#09193B] [&_button[aria-current=page]]:text-[#E88211]"
        aria-label="Navegação no celular"
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            className={page === item.id ? "" : ""}
            aria-current={page === item.id ? "page" : undefined}
            onClick={() => {
              setPage(item.id);
              setRoom("Todos");
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            <Icon name={item.icon} size={21} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      {notice && (
        <div
          className="fixed bottom-28 left-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-[#E88211]/50 bg-[#122849] p-4 text-xs text-[#E4EAF0] shadow-xl lg:bottom-6 lg:left-auto lg:max-w-md [&>p]:flex-1 [&>p]:leading-relaxed"
          role="status"
        >
          <Icon name="info" size={18} />
          <p>{notice}</p>
          <button
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#BBCCEF] hover:bg-[#3B6283]/30"
            onClick={() => setNotice("")}
            aria-label="Fechar aviso"
          >
            <Icon name="close" size={17} />
          </button>
        </div>
      )}
      {modal && (
        <Modal
          title={
            modal.type === "device"
              ? modal.device
                ? "Editar dispositivo"
                : "Novo dispositivo"
              : modal.type === "delete-account"
                ? "Excluir sua conta?"
                : "Excluir dispositivo?"
          }
          onClose={() => {
            if (!busy.delete) setModal(null);
          }}
        >
          {modal.type === "device" ? (
            <DeviceForm
              device={modal.device}
              onSave={saveDevice}
              onDelete={() =>
                setModal({
                  ...modal,
                  type: "delete-device",
                })
              }
            />
          ) : (
            <>
              <p className="text-[#BBCCEF]/65 leading-relaxed mb-6">
                {modal.type === "delete-account"
                  ? "Seu perfil e todos os dispositivos serão excluídos permanentemente."
                  : `O dispositivo “${modal.device.name}” será removido da sua casa.`}
              </p>
              <div className="flex gap-3">
                <button
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#E88211] focus-visible:outline-offset-4 border-[#3B6283] bg-[#3B6283]/10 text-[#BBCCEF] hover:bg-[#3B6283]/30 flex-1 justify-center"
                  disabled={busy.delete}
                  onClick={() => setModal(null)}
                >
                  Cancelar
                </button>
                <button
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#E88211] focus-visible:outline-offset-4 bg-[#E88211] text-[#09193B] hover:bg-[#E88211]/85 flex-1 justify-center"
                  disabled={busy.delete}
                  onClick={confirmDelete}
                >
                  {busy.delete ? "Excluindo…" : "Sim, excluir"}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
