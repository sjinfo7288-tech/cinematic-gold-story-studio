import { CalendarClock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, type Offer } from "@/lib/site";
import { whatsappUrl } from "@/lib/inquiry";
import { Reveal } from "./Reveal";

export function OfferCard({ offer, whatsapp, delay = 0 }: { offer: Offer; whatsapp: string; delay?: number }) {
  const text = `Hello SJ Photography and Cinematic, I am interested in your offer: "${offer.title}"${
    offer.discount_percent ? ` (${offer.discount_percent}% off)` : ""
  }. Please share the details.`;
  return (
    <Reveal as="article" delay={delay} className="group relative grid overflow-hidden rounded-sm border border-gold/30 bg-card shadow-card md:grid-cols-[1.1fr_1fr]">
      <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[320px]">
        {offer.image_url ? (
          <img src={offer.image_url} alt={offer.title} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[1500ms] group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gold-gradient opacity-25" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/40" />
        {offer.discount_percent > 0 && (
          <div className="absolute left-5 top-5 flex size-24 flex-col items-center justify-center rounded-full bg-gold-gradient text-primary-foreground shadow-gold md:size-28">
            <span className="font-display text-4xl font-semibold leading-none md:text-5xl">{offer.discount_percent}%</span>
            <span className="font-caps text-[0.6rem] tracking-[0.3em]">Off</span>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center p-6 md:p-10">
        <p className="font-caps text-[0.65rem] text-gold">Special Offer</p>
        <h3 className="mt-3 text-3xl font-medium leading-tight text-foreground md:text-4xl">{offer.title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{offer.description}</p>
        {offer.valid_until && (
          <p className="mt-6 flex items-center gap-2 text-sm text-gold-soft">
            <CalendarClock className="size-4" /> Valid till {formatDate(offer.valid_until)}
          </p>
        )}
        <Button asChild variant="gold" size="lg" className="mt-8 self-start">
          <a href={whatsappUrl(whatsapp, text)} target="_blank" rel="noreferrer">
            <MessageCircle /> Claim this offer
          </a>
        </Button>
      </div>
    </Reveal>
  );
}
