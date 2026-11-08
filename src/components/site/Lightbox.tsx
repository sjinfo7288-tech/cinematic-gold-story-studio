import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxItem = { url: string; title?: string | null };

export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const touchX = useRef<number | null>(null);
  const open = index !== null && items.length > 0;
  const prev = useCallback(() => index !== null && onIndex((index - 1 + items.length) % items.length), [index, items.length, onIndex]);
  const next = useCallback(() => index !== null && onIndex((index + 1) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, prev, next]);

  if (!open || typeof document === "undefined") return null;
  const item = items[index!];
  if (!item) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo preview"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
        touchX.current = null;
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold hover:text-primary-foreground"
      >
        <X />
      </button>
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ink/60 text-gold transition-colors hover:bg-gold hover:text-primary-foreground md:left-6"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ink/60 text-gold transition-colors hover:bg-gold hover:text-primary-foreground md:right-6"
          >
            <ChevronRight />
          </button>
        </>
      )}
      <figure className="flex max-h-full max-w-full flex-col items-center px-4 py-16" onClick={(e) => e.stopPropagation()}>
        <img
          key={item.url}
          src={item.url}
          alt={item.title ?? "Photo"}
          className="max-h-[78vh] max-w-[92vw] rounded-sm object-contain shadow-card animate-in fade-in zoom-in-95 duration-500"
        />
        <figcaption className="mt-5 text-center">
          {item.title && <p className="font-display text-2xl text-foreground">{item.title}</p>}
          <p className="mt-1 font-caps text-[0.65rem] text-gold">
            {index! + 1} / {items.length}
          </p>
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
}
