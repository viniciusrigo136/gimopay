import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

/** Modal acessível sobre <dialog> nativo (foco preso, Esc fecha, fundo inerte). */
export function Dialog({ open, onClose, title, description, children, footer, size = "md" }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-panel bg-graphite-800 p-0 text-pearl shadow-panel backdrop:bg-black/70 backdrop:backdrop-blur-sm",
        size === "sm" && "max-w-md",
        size === "md" && "max-w-xl",
        size === "lg" && "max-w-3xl",
      )}
    >
      {open ? (
        <div className="flex max-h-[85dvh] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-graphite-700 px-6 py-4">
            <div>
              <h2 id={titleId} className="text-lg font-bold">
                {title}
              </h2>
              {description ? <div className="mt-1 text-sm text-steel-400">{description}</div> : null}
            </div>
            <button type="button" onClick={onClose} className="rounded-md p-1 text-steel-400 hover:text-pearl" aria-label="Fechar">
              <X className="size-5" />
            </button>
          </header>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer ? <footer className="flex flex-wrap justify-end gap-2 border-t border-graphite-700 px-6 py-4">{footer}</footer> : null}
        </div>
      ) : null}
    </dialog>
  );
}
