import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import { siteDataQuery, instagramUrl, mailUrl, telUrl } from "@/lib/site";
import { whatsappUrl } from "@/lib/inquiry";

export function SiteFooter() {
  const { data } = useQuery(siteDataQuery);
  const s = data?.settings;
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-border bg-ink">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-3 md:px-8">
        <div>
          <div className="flex items-center gap-4">
            {s?.logo_url && (
              <img src={s.logo_url} alt="SJ logo" className="size-16 rounded-full border border-gold/40 object-cover" />
            )}
            <div>
              <p className="font-caps text-base text-gold">SJ Photography</p>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">and Cinematic</p>
            </div>
          </div>
          <p className="mt-6 max-w-xs font-display text-xl italic text-foreground/80">{s?.footer_text}</p>
        </div>

        <div>
          <p className="font-caps text-xs text-gold">Explore</p>
          <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-gold">Home</Link></li>
            <li><Link to="/gallery" className="hover:text-gold">Gallery</Link></li>
            <li><Link to="/services" className="hover:text-gold">Services</Link></li>
            <li><Link to="/offers" className="hover:text-gold">Special Offers</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Book a Shoot</Link></li>
            <li><Link to="/auth" className="hover:text-gold">Owner Login</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-caps text-xs text-gold">Get in touch</p>
          {s && (
            <ul className="mt-6 space-y-4 text-sm">
              <li>
                <a href={telUrl(s.mobile)} className="flex items-center gap-3 text-foreground/85 hover:text-gold">
                  <Phone className="size-4 text-gold" /> +91 {s.mobile}
                </a>
              </li>
              <li>
                <a href={whatsappUrl(s.whatsapp || s.mobile)} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-foreground/85 hover:text-gold">
                  <MessageCircle className="size-4 text-gold" /> WhatsApp us
                </a>
              </li>
              <li>
                <a href={mailUrl(s.email)} className="flex items-center gap-3 break-all text-foreground/85 hover:text-gold">
                  <Mail className="size-4 shrink-0 text-gold" /> {s.email}
                </a>
              </li>
              <li>
                <a href={instagramUrl(s.instagram)} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-foreground/85 hover:text-gold">
                  <Instagram className="size-4 text-gold" /> @{s.instagram.replace(/^@/, "")}
                </a>
              </li>
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs tracking-wider text-muted-foreground">
        © {year} SJ Photography and Cinematic. All rights reserved.
      </div>
    </footer>
  );
}
