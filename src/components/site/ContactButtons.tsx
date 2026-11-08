import { useQuery } from "@tanstack/react-query";
import { Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { instagramUrl, mailUrl, siteDataQuery, telUrl } from "@/lib/site";
import { whatsappUrl } from "@/lib/inquiry";
import { cn } from "@/lib/utils";

export function ContactButtons({ className }: { className?: string }) {
  const { data } = useQuery(siteDataQuery);
  const s = data?.settings;
  if (!s) return null;
  const hello = "Hello SJ Photography and Cinematic, I would like to know more about your photography services.";
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      <Button asChild variant="whatsapp" size="xl">
        <a href={whatsappUrl(s.whatsapp || s.mobile, hello)} target="_blank" rel="noreferrer">
          <MessageCircle /> WhatsApp
        </a>
      </Button>
      <Button asChild variant="gold" size="xl">
        <a href={telUrl(s.mobile)}>
          <Phone /> Call Now
        </a>
      </Button>
      <Button asChild variant="goldOutline" size="xl">
        <a href={instagramUrl(s.instagram)} target="_blank" rel="noreferrer">
          <Instagram /> Instagram
        </a>
      </Button>
      <Button asChild variant="goldOutline" size="xl">
        <a href={mailUrl(s.email)}>
          <Mail /> Email
        </a>
      </Button>
    </div>
  );
}

export function FloatingWhatsApp() {
  const { data } = useQuery(siteDataQuery);
  const s = data?.settings;
  if (!s) return null;
  return (
    <a
      href={whatsappUrl(s.whatsapp || s.mobile, "Hello SJ Photography and Cinematic!")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg transition-transform hover:scale-110 md:bottom-8 md:right-8"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
