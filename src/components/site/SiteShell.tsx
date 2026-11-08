import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { FloatingWhatsApp } from "./ContactButtons";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}

/** Banner used at the top of inner pages. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image?: string | null;
}) {
  return (
    <section className="grain relative flex min-h-[52vh] items-end overflow-hidden pb-16 pt-32 md:min-h-[60vh]">
      {image && (
        <img src={image} alt="" className="ken-burns absolute inset-0 size-full object-cover" aria-hidden="true" />
      )}
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-8">
        <p className="font-caps text-xs text-gold animate-in fade-in slide-in-from-bottom-4 duration-700">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-medium leading-[1.05] text-foreground animate-in fade-in slide-in-from-bottom-6 duration-1000 md:text-7xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-xl text-base text-foreground/75 animate-in fade-in duration-1000 md:text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
