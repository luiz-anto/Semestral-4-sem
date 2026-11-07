import Icon from "../components/ui/Icon";
export default function Chat() {
  return (
    <section className="panel chat-page">
      <div className="flex items-center gap-3 border-b border-neutral-200 pb-5">
        <span className="brand-icon">
          <Icon name="chat" />
        </span>
        <div>
          <h2 className="font-semibold">Assistente Smart Home</h2>
          <p className="muted text-xs mt-1">Em desenvolvimento</p>
        </div>
        <span className="tag ml-auto">Em breve</span>
      </div>
      <div className="chat-welcome">
        <span className="chat-symbol">
          <Icon name="chat" size={44} />
        </span>
        <p className="eyebrow mt-6">SUA CASA VAI OUVIR VOCÊ</p>
        <h2 className="text-3xl font-semibold tracking-tight mt-3">
          Como posso ajudar?
        </h2>
        <p className="muted text-sm mt-4 max-w-md leading-relaxed">
          Em breve, você poderá conversar com seu assistente para controlar seus
          dispositivos. Por enquanto, este espaço é apenas uma prévia da
          interface.
        </p>
        <div className="chat-suggestions">
          {[
            "Ligar as luzes da sala",
            "Ajustar o ar para 22 °C",
            "Desligar a televisão",
          ].map((text) => (
            <div key={text}>
              <Icon name="chat" size={16} />
              {text}
            </div>
          ))}
        </div>
      </div>
      <div className="chat-compose">
        <input
          aria-label="Mensagem para o assistente"
          placeholder="Seu assistente estará disponível em breve…"
          disabled
        />
        <button disabled aria-label="Enviar mensagem (em breve)">
          <Icon name="arrow" />
        </button>
      </div>
      <p className="text-xs muted text-center mt-3">
        O chat ainda não envia mensagens nem executa comandos.
      </p>
    </section>
  );
}
