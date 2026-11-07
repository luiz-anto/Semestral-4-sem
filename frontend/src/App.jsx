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
  { id: "home", label: "Visão geral", icon: "grid" },
  { id: "rooms", label: "Cômodos", icon: "rooms" },
  { id: "chat", label: "Chatbot", icon: "chat" },
  { id: "profile", label: "Meu perfil", icon: "user" },
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
      await request("/auth/register", { method: "POST", body: values });
    const auth = await request("/auth/login", {
      method: "POST",
      body: { email: values.email, password: values.password },
    });
    storeSession({ mode: "api", token: auth.access_token });
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
    setBusy((b) => ({ ...b, [device.id]: true }));
    try {
      const updated = demo
        ? { ...device, state: { ...device.state, ...patch } }
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
      setBusy((b) => ({ ...b, [device.id]: false }));
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
          ? { ...modal.device, ...data }
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
    setBusy((b) => ({ ...b, delete: true }));
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
      setBusy((b) => ({ ...b, delete: false }));
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
          storeSession({ mode: "demo" });
        }}
        message={authMessage}
      />
    );
  if (loading)
    return (
      <main className="loading-page">
        <span className="brand-icon">
          <Icon name="home" size={28} />
        </span>
        <h1 className="text-xl font-semibold mt-5">Preparando sua casa…</h1>
        <p className="muted mt-2">Um instante.</p>
      </main>
    );
  if (loadError)
    return (
      <main className="loading-page px-6">
        <Icon name="info" size={32} />
        <h1 className="text-xl font-semibold mt-5">
          Sua casa está fora de alcance.
        </h1>
        <p role="alert" className="muted mt-3 max-w-md text-center">
          {loadError}
        </p>
        <button
          className="button button-dark mt-6"
          onClick={() => setSession({ ...session })}
        >
          Tentar novamente
        </button>
        <button className="text-link mt-4" onClick={() => clearSession()}>
          Voltar para entrar
        </button>
      </main>
    );
  if (!user) return null;
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Ir para o conteúdo
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("home");
          }}
        >
          <span className="brand-icon">
            <Icon name="home" size={23} />
          </span>
          smart home<span className="brand-dot">®</span>
        </a>
        <div className="home-label">
          <span className="home-label-icon">
            <Icon name="home" size={18} />
          </span>
          <div>
            <strong>Minha casa</strong>
            <span>
              {demo ? "Ambiente de demonstração" : "Seu espaço conectado"}
            </span>
          </div>
        </div>
        <p className="nav-caption">SEU DIA A DIA</p>
        <nav aria-label="Menu principal">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              aria-current={page === item.id ? "page" : undefined}
              onClick={() => {
                setPage(item.id);
                setRoom("Todos");
              }}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
              {page === item.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="quiet-card">
            <Icon name="shield" size={23} />
            <strong>Conectada a você.</strong>
            <p>
              Pequenos controles.
              <br />
              Uma rotina mais simples.
            </p>
          </div>
          <button className="sidebar-user" onClick={() => setPage("profile")}>
            <span className="avatar">{user.name[0].toUpperCase()}</span>
            <span>
              <strong>{user.name}</strong>
              <small>{demo ? "Demonstração" : "Minha conta"}</small>
            </span>
            <Icon name="chevron" size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <a
            href="#"
            className="mobile-brand"
            onClick={(e) => {
              e.preventDefault();
              setPage("home");
            }}
          >
            <Icon name="home" size={23} />
            <strong>smart home</strong>
          </a>
          <p className="desktop-breadcrumb">
            Minha casa <span>/</span>{" "}
            {navItems.find((n) => n.id === page)?.label}
          </p>
          <div className="flex items-center gap-3">
            <span className="connection-label">
              <span />
              {demo ? "Modo demonstração" : "API conectada"}
            </span>
            <button
              className="avatar"
              aria-label="Abrir meu perfil"
              onClick={() => setPage("profile")}
            >
              {user.name[0].toUpperCase()}
            </button>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {demo && (
            <div className="demo-banner">
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
          <section className="page-intro">
            <div>
              <p className="eyebrow">
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
              <p className="muted mt-3">
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
                className="button button-dark add-device"
                onClick={() => setModal({ type: "device" })}
              >
                <Icon name="plus" size={19} />
                <span>Adicionar dispositivo</span>
              </button>
            )}
          </section>
          {(page === "home" || page === "rooms") && (
            <>
              <div className="stats-grid">
                <div className="stat">
                  <span className="small-symbol">
                    <Icon name="grid" />
                  </span>
                  <div>
                    <strong>{String(devices.length).padStart(2, "0")}</strong>
                    <p>Dispositivos</p>
                  </div>
                </div>
                <div className="stat">
                  <span className="small-symbol">
                    <Icon name="power" />
                  </span>
                  <div>
                    <strong>{String(active).padStart(2, "0")}</strong>
                    <p>Ligados agora</p>
                  </div>
                  <span className="stat-pill">
                    {devices.length
                      ? Math.round((active / devices.length) * 100)
                      : 0}
                    % ativos
                  </span>
                </div>
                <div className="stat">
                  <span className="small-symbol">
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
              <div className="dashboard-layout">
                <section className="device-section">
                  <div className="section-top">
                    <h2 className="section-heading">
                      {page === "rooms" ? "Seus cômodos" : "Seus dispositivos"}
                      <span>{visible.length}</span>
                    </h2>
                    <span className="text-xs muted hidden sm:block">
                      Uma casa mais simples.
                    </span>
                  </div>
                  <div
                    className="room-tabs"
                    role="group"
                    aria-label="Filtrar por cômodo"
                  >
                    {["Todos", ...rooms].map((name) => (
                      <button
                        key={name}
                        aria-pressed={room === name}
                        className={room === name ? "active" : ""}
                        onClick={() => setRoom(name)}
                      >
                        {name === "Todos" && <Icon name="grid" size={15} />}{" "}
                        {name}
                      </button>
                    ))}
                  </div>
                  {visible.length ? (
                    <div className="device-grid">
                      {visible.map((device) => (
                        <DeviceCard
                          key={device.id}
                          device={device}
                          selected={selected?.id === device.id}
                          busy={busy[device.id]}
                          onSelect={() => selectDevice(device)}
                          onToggle={() =>
                            changeState(device, { isOn: !device.state.isOn })
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <span className="empty-icon">
                        <Icon name="home" size={36} />
                      </span>
                      <h3>Uma casa cheia de possibilidades.</h3>
                      <p>
                        Adicione seu primeiro dispositivo e comece
                        <br className="hidden sm:block" /> a controlar sua
                        rotina por aqui.
                      </p>
                      <button
                        className="button button-dark mt-5"
                        onClick={() => setModal({ type: "device" })}
                      >
                        <Icon name="plus" size={18} />
                        Adicionar dispositivo
                      </button>
                    </div>
                  )}
                  <div className="home-note">
                    <span className="small-symbol">
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
                <aside className="dashboard-aside">
                  <div ref={controlsRef} className="controls-anchor">
                    {selected && (
                      <DeviceControls
                        key={selected.id}
                        device={selected}
                        busy={busy[selected.id]}
                        onSimulate={() => openSimulation(selected)}
                        onApply={(patch) => changeState(selected, patch)}
                        onEdit={() =>
                          setModal({ type: "device", device: selected })
                        }
                      />
                    )}
                  </div>
                  <section className="panel">
                    <Icon name="chat" size={28} />
                    <h3 className="text-xl font-semibold mt-4">
                      Vamos conversar?
                    </h3>
                    <p className="muted text-sm mt-2">
                      Seu assistente para a casa está chegando.
                    </p>
                    <button
                      className="text-link mt-4"
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
              onDelete={() => setModal({ type: "delete-account" })}
              onLogout={logout}
            />
          )}
          <footer className="page-footer">
            <span>
              smart home <span className="mx-2">/</span> Sua casa, no seu ritmo.
            </span>
            <span>PROJETO ACADÊMICO · DISPOSITIVOS SIMULADOS</span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Navegação no celular">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={page === item.id ? "active" : ""}
            aria-current={page === item.id ? "page" : undefined}
            onClick={() => {
              setPage(item.id);
              setRoom("Todos");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Icon name={item.icon} size={21} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      {notice && (
        <div className="toast" role="status">
          <Icon name="info" size={18} />
          <p>{notice}</p>
          <button
            className="icon-button"
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
              rooms={rooms.filter((r) => r !== "Sem cômodo")}
              onSave={saveDevice}
              onDelete={() => setModal({ ...modal, type: "delete-device" })}
            />
          ) : (
            <>
              <p className="muted leading-relaxed mb-6">
                {modal.type === "delete-account"
                  ? "Seu perfil e todos os dispositivos serão excluídos permanentemente."
                  : `O dispositivo “${modal.device.name}” será removido da sua casa.`}
              </p>
              <div className="flex gap-3">
                <button
                  className="button button-outline flex-1 justify-center"
                  disabled={busy.delete}
                  onClick={() => setModal(null)}
                >
                  Cancelar
                </button>
                <button
                  className="button button-dark flex-1 justify-center"
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
