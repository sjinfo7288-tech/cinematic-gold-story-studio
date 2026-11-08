import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Expand } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { Lightbox } from "@/components/site/Lightbox";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { siteDataQuery } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — SJ Photography and Cinematic" },
      { name: "description", content: "Browse wedding, maternity, birthday and drone photography plus cinematic films by SJ Photography and Cinematic." },
      { property: "og:title", content: "Photo & Video Gallery — SJ Photography and Cinematic" },
      { property: "og:description", content: "Premium photo galleries and cinematic films by SJ Photography and Cinematic." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteDataQuery),
  component: GalleryPage,
});

function GalleryPage() {
  const { data } = useSuspenseQuery(siteDataQuery);
  const { photos, galleries, videos, settings } = data;
  const [filter, setFilter] = useState<string>("all");
  const [preview, setPreview] = useState<number | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? photos : photos.filter((p) => p.gallery_id === filter)),
    [photos, filter],
  );
  const usedGalleries = galleries.filter((g) => photos.some((p) => p.gallery_id === g.id));

  return (
    <SiteShell>
      <PageHero eyebrow="Gallery" title="Moments framed in gold" subtitle="Weddings, maternity, birthdays and breathtaking views from above." image={photos[1]?.url ?? settings.hero_background_url} />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {[{ id: "all", name: "All Photos" }, ...usedGalleries].map((g) => (
              <button
                key={g.id}
                onClick={() => setFilter(g.id)}
                className={cn(
                  "rounded-full border px-5 py-2 text-sm tracking-wide transition-all duration-300",
                  filter === g.id ? "border-gold bg-gold text-primary-foreground" : "border-border text-foreground/80 hover:border-gold/60 hover:text-gold",
                )}
              >
                {g.name}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">New photos are coming soon.</p>
          ) : (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {visible.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 100} className="mb-5 break-inside-avoid">
                  <button onClick={() => setPreview(i)} className="group relative block w-full overflow-hidden rounded-sm border border-gold/15 text-left">
                    <img src={p.url} alt={p.title || "Gallery photo"} loading="lazy" className="w-full transition-transform duration-[1200ms] group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-ink/90 via-transparent to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <span className="font-display text-xl text-foreground">{p.title}</span>
                      <Expand className="size-5 text-gold" />
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {videos.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHeading eyebrow="Video Gallery" title="Cinematic films" subtitle="Highlights, reels and films crafted with music, colour and emotion." />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v, i) => {
                const vertical = v.source === "upload";
                return (
                  <Reveal key={v.id} delay={(i % 3) * 120}>
                    <div className={cn("overflow-hidden rounded-sm border border-gold/25 bg-ink shadow-card", vertical ? "aspect-[9/16] max-h-[640px] mx-auto" : "aspect-video")}>
                      <VideoPlayer url={v.url} title={v.title} className={vertical ? "object-contain" : undefined} />
                    </div>
                    <p className="mt-4 text-center font-display text-xl text-foreground">{v.title}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Lightbox items={visible} index={preview} onIndex={setPreview} onClose={() => setPreview(null)} />
    </SiteShell>
  );
}
