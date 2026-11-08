import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { siteDataQuery, telUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/services", label: "Services" },
  { to: "/offers", label: "Offers" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { data } = useQuery(siteDataQuery);
  const s = data?.settings;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500",
        scrolled ? "border-b border-border bg-ink/85 py-2 backdrop-blur-md" : "bg-transparent py-4",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          {s?.logo_url && (
            <img
              src={s.logo_url}
              alt="SJ logo"
              className="size-11 shrink-0 rounded-full border border-gold/40 object-cover md:size-12"
            />
          )}
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-caps text-sm text-gold md:text-base">SJ Photography</span>
            <span className="block truncate text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
              and Cinematic
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="relative text-sm tracking-wide text-foreground/80 transition-colors hover:text-gold"
              activeProps={{ className: "!text-gold" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {s?.mobile && (
            <Button asChild variant="goldOutline" size="icon" className="hidden sm:inline-flex" aria-label="Call now">
              <a href={telUrl(s.mobile)}>
                <Phone />
              </a>
            </Button>
          )}
          <Button asChild variant="gold" className="hidden sm:inline-flex">
            <Link to="/contact">Book Now</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="goldOutline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col border-gold/20 bg-ink">
              <SheetTitle className="font-caps text-sm text-gold">Menu</SheetTitle>
              <nav className="mt-8 flex flex-col gap-1">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: n.to === "/" }}
                    className="border-b border-border py-4 font-display text-2xl text-foreground transition-colors hover:text-gold"
                    activeProps={{ className: "text-gold" }}
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
              <Button asChild variant="gold" size="xl" className="mt-auto">
                <Link to="/contact" onClick={() => setOpen(false)}>
                  Book Your Photoshoot
                </Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
