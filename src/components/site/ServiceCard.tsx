import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceIcon } from "@/lib/icons";
import type { Service } from "@/lib/site";
import { Reveal } from "./Reveal";

export function ServiceCard({ service, delay = 0 }: { service: Service; delay?: number }) {
  return (
    <Reveal as="article" delay={delay} className="group relative flex flex-col overflow-hidden rounded-sm border border-border bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-gold/50">
      <div className="relative aspect-[4/3] overflow-hidden">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
          />
        ) : (
          <div className="size-full bg-gold-gradient opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        <div className="absolute -bottom-7 left-6 flex size-16 items-center justify-center rounded-full border border-gold/60 bg-ink text-gold shadow-gold transition-transform duration-500 group-hover:rotate-[360deg]">
          <ServiceIcon name={service.icon} className="size-7" />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-12">
        <h3 className="text-3xl font-medium text-foreground">{service.title}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
        <Button asChild variant="goldOutline" className="mt-6 self-start">
          <Link to="/contact" search={{ service: service.title }}>
            Send Inquiry <ArrowRight />
          </Link>
        </Button>
      </div>
    </Reveal>
  );
}
