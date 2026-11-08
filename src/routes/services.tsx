import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { SectionHeading } from "@/components/site/Reveal";
import { ServiceCard } from "@/components/site/ServiceCard";
import { ContactButtons } from "@/components/site/ContactButtons";
import { siteDataQuery } from "@/lib/site";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — SJ Photography and Cinematic" },
      { name: "description", content: "Maternity, birthday, drone photography, cinematography and all types of photography by SJ Photography and Cinematic." },
      { property: "og:title", content: "Photography Services — SJ Photography and Cinematic" },
      { property: "og:description", content: "Premium maternity, birthday, drone and cinematic photography services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteDataQuery),
  component: ServicesPage,
});

function ServicesPage() {
  const { data } = useSuspenseQuery(siteDataQuery);
  return (
    <SiteShell>
      <PageHero eyebrow="Our Services" title="Every occasion, beautifully told" subtitle="Choose a service and send us an inquiry — we'll plan the perfect shoot with you." image={data.photos[2]?.url ?? data.settings.hero_background_url} />
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.services.map((s, i) => (
              <ServiceCard key={s.id} service={s} delay={(i % 3) * 120} />
            ))}
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <SectionHeading eyebrow="Talk to us" title="Have a question?" subtitle="We reply fastest on WhatsApp." />
          <ContactButtons />
        </div>
      </section>
    </SiteShell>
  );
}
