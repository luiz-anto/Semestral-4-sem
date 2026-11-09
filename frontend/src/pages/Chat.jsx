import Icon from "../components/ui/Icon";
export default function Chat() {
  return (
    <section className="min-w-0 rounded-3xl border border-[#3B6283]/50 bg-[#122849] p-5 text-[#E4EAF0] sm:p-6 mx-auto max-w-4xl">
      <div className="flex items-center gap-3 border-b border-[#3B6283]/40 pb-5">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full">
          <Icon name="chat" />
        </span>
        <div>
          <h2 className="font-semibold">Assistente KiloW</h2>
          <p className="text-[#BBCCEF]/65 text-xs mt-1">Em desenvolvimento</p>
        </div>
        <span className="rounded-full border border-[#3B6283] bg-[#3B6283]/15 px-3 py-1 text-[10px] text-[#BBCCEF] ml-auto">
          Em breve
        </span>
      </div>
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
          Em breve, você poderá conversar com seu assistente para controlar seus
          dispositivos. Por enquanto, este espaço é apenas uma prévia da
          interface.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 [&>div]:flex [&>div]:items-center [&>div]:gap-2 [&>div]:rounded-xl [&>div]:border [&>div]:border-[#3B6283] [&>div]:p-3 [&>div]:text-xs [&>div]:text-[#BBCCEF]">
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
      <div className="flex gap-3 rounded-2xl border border-[#3B6283] bg-[#3B6283]/20 p-3 [&_input]:min-w-0 [&_input]:flex-1 [&_input]:bg-transparent [&_input]:p-2 [&_input]:text-xs [&_input]:text-[#BBCCEF] [&_button]:rounded-xl [&_button]:bg-[#E88211] [&_button]:p-3 [&_button]:text-[#09193B]">
        <input
          aria-label="Mensagem para o assistente"
          placeholder="Seu assistente estará disponível em breve…"
          disabled
        />
        <button disabled aria-label="Enviar mensagem (em breve)">
          <Icon name="arrow" />
        </button>
      </div>
      <p className="text-xs text-[#BBCCEF]/65 text-center mt-3">
        O chat ainda não envia mensagens nem executa comandos.
      </p>
    </section>
  );
}
