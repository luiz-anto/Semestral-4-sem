import { useEffect, useRef } from "react";
import Icon from "./Icon";
export default function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    dialog.querySelector("input,select")?.focus();
    return () => {
      dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="modal-title"
      onClick={(event) => {
        if (event.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          )
            onClose();
        }
      }}
      className="m-auto max-h-[90dvh] w-[calc(100%_-_32px)] max-w-md overflow-y-auto rounded-3xl border border-[#3B6283] bg-[#09193B] p-6 text-[#E4EAF0] font-['Tenor_Sans',sans-serif] backdrop:bg-[#09193B]/80 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 id="modal-title" className="text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        <button
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#BBCCEF] hover:bg-[#3B6283]/30"
          onClick={onClose}
          aria-label="Fechar janela"
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
