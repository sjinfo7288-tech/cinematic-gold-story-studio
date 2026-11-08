import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Camera, ChevronDown, Film, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { PhotoSlider } from "@/components/site/PhotoSlider";
import { ServiceCard } from "@/components/site/ServiceCard";
import { OfferCard } from "@/components/site/OfferCard";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { ContactButtons } from "@/components/site/ContactButtons";
import { isOfferActive, siteDataQuery } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SJ Photography and Cinematic — Luxury Photography & Films" },
      {
        name: "description",
        content:
          "SJ Photography and Cinematic: premium maternity, birthday, drone, wedding photography and cinematic films. Book your photoshoot today.",
      },
      { property: "og:title", content: "SJ Photography and Cinematic" },
      {
        property: "og:description",
        content: "Luxury photography and cinematic films for the moments you want to relive forever.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteDataQuery),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(siteDataQuery);
  const { settings: s, photos, services, offers, videos } = data;
  const sliderPhotos = photos.filter((p) => p.in_slider);
  const activeOffers = offers.filter((o) => isOfferActive(o)).slice(0, 2);
  const featured = s.featured_video_url || videos[0]?.url;

  return (
    <SiteShell>
      {/* HERO */}
      <section className="grain relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-28">
        {s.hero_background_url && (
          <img src={s.hero_background_url} alt="" aria-hidden="true" className="ken-burns absolute inset-0 size-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/40" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 md:px-8 lg:grid-cols-[1.25fr_1fr]">
          <div>
            {s.logo_url && (
              <img
                src={s.logo_url}
                alt="SJ Photography and Cinematic logo"
                className="mb-8 size-28 rounded-full border border-gold/40 object-cover shadow-gold animate-in fade-in zoom-in-90 duration-1000 md:size-36"
              />
            )}
            <p className="font-caps text-xs text-gold animate-in fade-in slide-in-from-bottom-4 duration-700">{s.tagline}</p>
            <h1 className="mt-5 text-5xl font-medium leading-[1.02] text-foreground animate-in fade-in slide-in-from-bottom-6 duration-1000 sm:text-6xl lg:text-8xl">
              <span className="block font-caps text-[0.42em] tracking-[0.18em] text-gold-gradient">SJ Photography</span>
              <span className="block italic">{s.hero_title}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/80 animate-in fade-in duration-1000 md:text-lg">
              {s.hero_subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Button asChild variant="gold" size="xl">
                <Link to="/contact">
                  <Camera /> Book Your Photoshoot
                </Link>
              </Button>
              <Button asChild variant="goldOutline" size="xl">
                <Link to="/gallery">View Gallery</Link>
              </Button>
            </div>
          </div>

          {featured && (
            <div className="relative mx-auto w-full max-w-[340px] animate-in fade-in slide-in-from-right-8 duration-1000 lg:ml-auto">
              <div className="absolute -inset-3 rounded-[2rem] border border-gold/30" />
              <div className="relative aspect-[9/16] overflow-hidden rounded-[1.6rem] border border-gold/50 bg-ink shadow-gold">
                <VideoPlayer url={featured} title="SJ cinematic showreel" ambient />
              </div>
              <p className="mt-5 flex items-center justify-center gap-2 font-caps text-[0.6rem] text-gold">
                <Film className="size-3.5" /> Cinematic Showreel
              </p>
            </div>
          )}
        </div>

        <a href="#welcome" aria-label="Scroll down" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gold/80 animate-bounce">
          <ChevronDown className="size-7" />
        </a>
      </section>

      {/* WELCOME */}
      <section id="welcome" className="relative py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 md:px-8 lg:grid-cols-2">
          <Reveal>
            <p className="font-caps text-xs text-gold">Welcome</p>
            <h2 className="mt-4 text-4xl font-medium leading-tight md:text-6xl">{s.welcome_title}</h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/80">{s.welcome_text}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">{s.about_text}</p>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-8">
              {[
                { icon: Camera, label: "Photography" },
                { icon: Film, label: "Cinematic Films" },
                { icon: Sparkles, label: "Drone Shoots" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center">
                  <Icon className="mx-auto size-7 text-gold" strokeWidth={1.3} />
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150} className="relative">
            <div className="grid grid-cols-2 gap-4">
              {photos.slice(0, 4).map((p, i) => (
                <div key={p.id} className={i % 2 === 1 ? "translate-y-10" : ""}>
                  <img src={p.url} alt={p.title} loading="lazy" className="aspect-[3/4] w-full rounded-sm border border-gold/20 object-cover shadow-card" />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* SLIDER */}
      {sliderPhotos.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="px-4">
            <SectionHeading eyebrow="Portfolio" title="Frames we love" subtitle="A glimpse of the stories we've had the honour to capture." />
          </div>
          <PhotoSlider photos={sliderPhotos} />
          <div className="mt-10 text-center">
            <Button asChild variant="goldOutline" size="lg">
              <Link to="/gallery">
                Explore full gallery <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* SERVICES */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeading eyebrow="Our Services" title="Crafted for every celebration" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((sv, i) => (
              <ServiceCard key={sv.id} service={sv} delay={(i % 3) * 120} />
            ))}
          </div>
        </div>
      </section>

      {/* OFFERS */}
      {activeOffers.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <SectionHeading eyebrow="Limited Time" title="Special offers" />
            <div className="grid gap-8">
              {activeOffers.map((o, i) => (
                <OfferCard key={o.id} offer={o} whatsapp={s.whatsapp || s.mobile} delay={i * 120} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button asChild variant="goldOutline" size="lg">
                <Link to="/offers">
                  See all offers <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <Reveal className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="grain relative overflow-hidden rounded-sm border border-gold/40 bg-card px-6 py-14 text-center shadow-gold md:px-16">
            <p className="font-caps text-xs text-gold">Let's create magic</p>
            <h2 className="mt-4 text-4xl font-medium md:text-6xl">Ready for your photoshoot?</h2>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
              Reach us on WhatsApp, call, email or Instagram — or send a detailed inquiry and we will get back to you.
            </p>
            <ContactButtons className="mt-10" />
            <Button asChild variant="link" className="mt-6 text-gold">
              <Link to="/contact">
                Send a detailed inquiry <ArrowRight />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
