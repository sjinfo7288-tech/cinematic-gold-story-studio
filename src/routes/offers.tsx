import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { OfferCard } from "@/components/site/OfferCard";
import { Reveal } from "@/components/site/Reveal";
import { isOfferActive, siteDataQuery } from "@/lib/site";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Special Offers — SJ Photography and Cinematic" },
      { name: "description", content: "Current discounts and special photography packages from SJ Photography and Cinematic." },
      { property: "og:title", content: "Special Offers — SJ Photography and Cinematic" },
      { property: "og:description", content: "Limited-time discounts on maternity, birthday, drone and cinematic photography." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteDataQuery),
  component: OffersPage,
});

function OffersPage() {
  const { data } = useSuspenseQuery(siteDataQuery);
  const offers = data.offers.filter((o) => isOfferActive(o));
  const s = data.settings;

  return (
    <SiteShell>
      <PageHero eyebrow="Special Offers" title="Exclusive offers, limited time" subtitle="Save on your next photoshoot with our latest packages." image={data.photos[0]?.url ?? s.hero_background_url} />
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          {offers.length === 0 ? (
            <Reveal className="mx-auto max-w-xl rounded-sm border border-gold/30 bg-card px-6 py-16 text-center shadow-card">
              <Gift className="mx-auto size-12 text-gold" strokeWidth={1.2} />
              <h2 className="mt-6 text-4xl font-medium">New offers coming soon</h2>
              <p className="mt-4 text-muted-foreground">
                There are no active offers right now. Follow us or message us on WhatsApp to hear about the next one first.
              </p>
              <Button asChild variant="gold" size="lg" className="mt-8">
                <Link to="/contact">Book Your Photoshoot</Link>
              </Button>
            </Reveal>
          ) : (
            <div className="grid gap-10">
              {offers.map((o, i) => (
                <OfferCard key={o.id} offer={o} whatsapp={s.whatsapp || s.mobile} delay={i * 100} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
