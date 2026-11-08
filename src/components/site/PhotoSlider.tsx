import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Pause, Play } from "lucide-react";
import { Lightbox } from "./Lightbox";
import type { Photo } from "@/lib/site";
import { cn } from "@/lib/utils";

const INTERVAL = 5000;

export function PhotoSlider({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const count = photos.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (!playing || hover || preview !== null || count < 2) return;
    const t = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [index, playing, hover, preview, count, go]);

  if (count === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <div
        className="group relative aspect-[4/5] overflow-hidden rounded-sm border border-gold/25 bg-ink shadow-card sm:aspect-[16/10] lg:aspect-[16/8]"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
          if (Math.abs(dx) > 40) go(dx > 0 ? index - 1 : index + 1);
          touchX.current = null;
        }}
      >
        {photos.map((p, i) => (
          <div
            key={p.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1200ms] ease-out",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            aria-hidden={i !== index}
          >
            {/* Blurred fill keeps portrait photos elegant on wide screens */}
            <img src={p.url} alt="" aria-hidden="true" className="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-2xl" />
            <img
              src={p.url}
              alt={p.title || "SJ Photography work"}
              loading={i === 0 ? "eager" : "lazy"}
              className={cn("relative size-full object-contain", i === index && "ken-burns")}
            />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/90 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-8">
          <div className="min-w-0">
            <p className="font-caps text-[0.65rem] text-gold">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
            <p key={index} className="mt-2 truncate font-display text-2xl text-foreground animate-in fade-in slide-in-from-bottom-2 duration-700 md:text-4xl">
              {photos[index]?.title}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <SliderBtn label={playing ? "Pause slideshow" : "Play slideshow"} onClick={() => setPlaying((v) => !v)}>
              {playing ? <Pause /> : <Play />}
            </SliderBtn>
            <SliderBtn label="View full screen" onClick={() => setPreview(index)}>
              <Expand />
            </SliderBtn>
          </div>
        </div>

        {count > 1 && (
          <>
            <SliderBtn label="Previous photo" onClick={() => go(index - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 md:left-6">
              <ChevronLeft />
            </SliderBtn>
            <SliderBtn label="Next photo" onClick={() => go(index + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 md:right-6">
              <ChevronRight />
            </SliderBtn>
          </>
        )}

        {playing && !hover && count > 1 && (
          <div key={`bar-${index}`} className="absolute inset-x-0 top-0 h-0.5 bg-gold/20">
            <div className="h-full origin-left bg-gold" style={{ animation: `slider-progress ${INTERVAL}ms linear forwards` }} />
          </div>
        )}
      </div>

      {/* Thumbnails for manual navigation */}
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {photos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => go(i)}
            aria-label={`Show photo ${i + 1}`}
            className={cn(
              "relative h-16 w-24 shrink-0 overflow-hidden rounded-sm border transition-all duration-300 md:h-20 md:w-32",
              i === index ? "border-gold opacity-100" : "border-transparent opacity-50 hover:opacity-90",
            )}
          >
            <img src={p.url} alt="" className="size-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      <style>{`@keyframes slider-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>

      <Lightbox items={photos} index={preview} onIndex={(i) => { setPreview(i); go(i); }} onClose={() => setPreview(null)} />
    </div>
  );
}

function SliderBtn({
  children,
  label,
  onClick,
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex size-11 items-center justify-center rounded-full border border-gold/50 bg-ink/60 text-gold backdrop-blur-sm transition-all duration-300 hover:bg-gold hover:text-primary-foreground [&_svg]:size-5",
        className,
      )}
    >
      {children}
    </button>
  );
}
