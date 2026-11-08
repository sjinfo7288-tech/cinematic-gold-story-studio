import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={cn("mb-12 md:mb-16", align === "center" ? "text-center" : "text-left")}>
      <p className="font-caps text-xs text-gold">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-medium leading-tight text-foreground md:text-6xl">{title}</h2>
      <div
        className={cn(
          "mt-6 flex items-center gap-3",
          align === "center" ? "justify-center" : "justify-start",
        )}
      >
        <span className="h-px w-12 bg-gold/60" />
        <span className="size-1.5 rotate-45 bg-gold" />
        <span className="h-px w-12 bg-gold/60" />
      </div>
      {subtitle && (
        <p
          className={cn(
            "mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
