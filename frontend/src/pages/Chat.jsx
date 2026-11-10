import { useRef, useEffect, useState } from "react";
import Icon from "../components/ui/Icon";
import { sendChatMessage } from "../services/api";
const SUGGESTIONS = [
  "Ligar as luzes da sala",
  "Ajustar o ar para 22 °C",
  "Desligar a televisão",
];
export default function Chat({ token, demo, onDevicesChanged, onError }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages]);
  async function send(content) {
    const message = content.trim();
    if (!message || sending) return;
    setText("");
    setMessages((m) => [...m, { from: "user", text: message }]);
    setSending(true);
    try {
      const data = await sendChatMessage(message, token);
      setMessages((m) => [...m, { from: "bot", text: data.resposta }]);
      if (data.dispositivos?.length) onDevicesChanged(data.dispositivos);
    } catch (error) {
      if (error.status === 401) onError(error);
      else setMessages((m) => [...m, { from: "bot", text: error.message }]);
    } finally {
      setSending(false);
    }
  }
  return (
    <section className="min-w-0 rounded-3xl border border-[#3B6283]/50 bg-[#122849] p-5 text-[#E4EAF0] sm:p-6 mx-auto max-w-4xl">
      <div className="flex items-center gap-3 border-b border-[#3B6283]/40 pb-5">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full">
          <Icon name="chat" />
        </span>
        <div>
          <h2 className="font-semibold">Assistente KiloW</h2>
          <p className="text-[#BBCCEF]/65 text-xs mt-1">
            {demo ? "Indisponível no modo demonstração" : "Online"}
          </p>
        </div>
      </div>
      {messages.length ? (
        <div className="flex min-h-96 flex-col gap-3 py-6" aria-live="polite">
          {messages.map((m, i) => (
            <p
              key={i}
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.from === "user" ? "self-end bg-[#E88211] text-[#09193B]" : "self-start bg-[#3B6283]/30 text-[#E4EAF0]"}`}
            >
              {m.text}
            </p>
          ))}
          <div ref={endRef} />
        </div>
      ) : (
      <div className="flex min-h-96 flex-col items-center justify-center py-10 text-center">
        <span className="rounded-3xl bg-[#3B6283]/20 p-6 text-[#E88211]">
          <Icon name="chat" size={44} />
        </span>
        <p className="text-[10px] uppercase tracking-[.18em] text-[#BBCCEF]/60 mt-6">
          SUA CASA VAI OUVIR VOCÊ
        </p>
        <h2 className="text-3xl font-semibold tracking-tight mt-3">
          Como posso ajudar?
        </h2>
        <p className="text-[#BBCCEF]/65 text-sm mt-4 max-w-md leading-relaxed">
          Escreva o que você quer fazer com a luz, a TV ou o ar-condicionado.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 [&>div]:flex [&>div]:items-center [&>div]:gap-2 [&>div]:rounded-xl [&>div]:border [&>div]:border-[#3B6283] [&>div]:p-3 [&>div]:text-xs [&>div]:text-[#BBCCEF]">
          {SUGGESTIONS.map((suggestion) => (
            <div key={suggestion}>
              <button
                type="button"
                className="flex items-center gap-2 !bg-transparent !p-0 !text-[#BBCCEF] disabled:opacity-40"
                disabled={demo || sending}
                onClick={() => send(suggestion)}
              >
                <Icon name="chat" size={16} />
                {suggestion}
              </button>
            </div>
          ))}
        </div>
      </div>
      )}
      <form
        className="flex gap-3 rounded-2xl border border-[#3B6283] bg-[#3B6283]/20 p-3 [&_input]:min-w-0 [&_input]:flex-1 [&_input]:bg-transparent [&_input]:p-2 [&_input]:text-xs [&_input]:text-[#BBCCEF] [&_button]:rounded-xl [&_button]:bg-[#E88211] [&_button]:p-3 [&_button]:text-[#09193B] [&_button:disabled]:opacity-40"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <input
          aria-label="Mensagem para o assistente"
          placeholder={
            demo
              ? "Entre com uma conta para usar o assistente"
              : "Ex.: ligue a luz da sala"
          }
          value={text}
          maxLength={300}
          onChange={(e) => setText(e.target.value)}
          disabled={demo || sending}
        />
        <button
          type="submit"
          disabled={demo || sending || !text.trim()}
          aria-label="Enviar mensagem"
        >
          <Icon name="arrow" />
        </button>
      </form>
    </section>
  );
}
