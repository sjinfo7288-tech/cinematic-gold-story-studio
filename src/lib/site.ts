import { queryOptions } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { getSiteData } from "./site-data.functions";

type Tables = Database["public"]["Tables"];
export type SiteSettings = Tables["site_settings"]["Row"];
export type Gallery = Tables["galleries"]["Row"];
export type Photo = Tables["photos"]["Row"];
export type Video = Tables["videos"]["Row"];
export type Service = Tables["services"]["Row"];
export type Offer = Tables["offers"]["Row"];

export type SiteData = {
  settings: SiteSettings;
  galleries: Gallery[];
  photos: Photo[];
  videos: Video[];
  services: Service[];
  offers: Offer[];
};

export const siteDataQuery = queryOptions({
  queryKey: ["site-data"],
  queryFn: () => getSiteData() as Promise<SiteData>,
  staleTime: 30_000,
});

export const DEFAULT_SERVICES = [
  "Maternity Photography",
  "Birthday Photography",
  "Drone Photography",
  "Cinematography",
  "All Types of Photography",
];

export function instagramUrl(handle: string) {
  const clean = handle.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
  return `https://instagram.com/${clean}`;
}

export function telUrl(mobile: string) {
  const digits = mobile.replace(/[^\d+]/g, "");
  return `tel:${digits.length === 10 ? `+91${digits}` : digits}`;
}

export function mailUrl(email: string, subject = "Photoshoot inquiry") {
  return `mailto:${email.trim()}?subject=${encodeURIComponent(subject)}`;
}

/** Today's date as YYYY-MM-DD in the visitor's local time. */
export function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** An offer is shown to visitors until the end of its validity date. No date = always valid. */
export function isOfferActive(offer: Pick<Offer, "valid_until">, today = todayISO()) {
  return !offer.valid_until || offer.valid_until >= today;
}

export function formatDate(iso: string | null) {
  if (!iso) return "";
  const [y = 1970, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type ParsedVideo =
  | { kind: "youtube"; embed: string }
  | { kind: "vimeo"; embed: string }
  | { kind: "file"; src: string };

export function parseVideo(url: string): ParsedVideo {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { kind: "youtube", embed: `https://www.youtube.com/embed/${yt[1]}?rel=0` };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: "vimeo", embed: `https://player.vimeo.com/video/${vm[1]}` };
  return { kind: "file", src: url };
}
