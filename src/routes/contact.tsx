import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { ContactButtons } from "@/components/site/ContactButtons";
import { InquiryForm } from "@/components/site/InquiryForm";
import { DEFAULT_SERVICES, instagramUrl, mailUrl, siteDataQuery, telUrl } from "@/lib/site";
import { whatsappUrl } from "@/lib/inquiry";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): { service?: string } =>
    typeof search["service"] === "string" ? { service: search["service"].slice(0, 100) } : {},
  head: () => ({
    meta: [
      { title: "Contact & Book — SJ Photography and Cinematic" },
      { name: "description", content: "Book your photoshoot with SJ Photography and Cinematic. Call, WhatsApp, email or send an inquiry." },
      { property: "og:title", content: "Book Your Photoshoot — SJ Photography and Cinematic" },
      { property: "og:description", content: "Send an inquiry on WhatsApp or call SJ Photography and Cinematic." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteDataQuery),
  component: ContactPage,
});

function ContactPage() {
  const { data } = useSuspenseQuery(siteDataQuery);
  const { service } = Route.useSearch();
  const s = data.settings;
  const serviceNames = data.services.length ? data.services.map((x) => x.title) : DEFAULT_SERVICES;
  const wa = s.whatsapp || s.mobile;

  const cards = [
    { icon: Phone, label: "Mobile", value: `+91 ${s.mobile}`, href: telUrl(s.mobile) },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: whatsappUrl(wa), external: true },
    { icon: Mail, label: "Email", value: s.email, href: mailUrl(s.email) },
    { icon: Instagram, label: "Instagram", value: `@${s.instagram.replace(/^@/, "")}`, href: instagramUrl(s.instagram), external: true },
  ];

  return (
    <SiteShell>
      <PageHero eyebrow="Contact" title="Let's plan your shoot" subtitle="Tell us about your event and we'll get back to you on WhatsApp." image={data.photos[3]?.url ?? s.hero_background_url} />

      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-8 lg:grid-cols-[1fr_1.5fr]">
          <Reveal>
            <p className="font-caps text-xs text-gold">Contact Information</p>
            <h2 className="mt-4 text-4xl font-medium md:text-5xl">We'd love to hear from you</h2>
            <div className="mt-10 grid gap-4">
              {cards.map(({ icon: Icon, label, value, href, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group flex items-center gap-5 rounded-sm border border-border bg-card p-5 transition-all duration-300 hover:border-gold/60"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold transition-colors group-hover:bg-gold group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-caps text-[0.6rem] text-gold">{label}</span>
                    <span className="mt-1 block break-all text-foreground">{value}</span>
                  </span>
                </a>
              ))}
            </div>
            <ContactButtons className="mt-8 sm:grid-cols-2" />
          </Reveal>

          <Reveal delay={150}>
            <div className="rounded-sm border border-gold/30 bg-card p-6 shadow-card md:p-10">
              <p className="font-caps text-xs text-gold">Inquiry Form</p>
              <h2 className="mt-3 text-4xl font-medium">Book your photoshoot</h2>
              <p className="mb-8 mt-3 text-sm text-muted-foreground">All fields are required.</p>
              <InquiryForm services={serviceNames} whatsapp={wa} defaultService={service} />
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
