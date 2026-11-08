import {
  Aperture,
  Baby,
  Cake,
  Camera,
  Clapperboard,
  Crown,
  Drone,
  Film,
  Flower2,
  Gem,
  Gift,
  Heart,
  PartyPopper,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, { label: string; Icon: LucideIcon }> = {
  camera: { label: "Camera", Icon: Camera },
  baby: { label: "Baby / Maternity", Icon: Baby },
  cake: { label: "Birthday cake", Icon: Cake },
  drone: { label: "Drone", Icon: Drone },
  clapperboard: { label: "Clapperboard", Icon: Clapperboard },
  film: { label: "Film reel", Icon: Film },
  video: { label: "Video camera", Icon: Video },
  aperture: { label: "Aperture", Icon: Aperture },
  heart: { label: "Heart / Couple", Icon: Heart },
  gem: { label: "Ring / Wedding", Icon: Gem },
  crown: { label: "Crown", Icon: Crown },
  flower: { label: "Flower", Icon: Flower2 },
  gift: { label: "Gift", Icon: Gift },
  party: { label: "Party", Icon: PartyPopper },
  sparkles: { label: "Sparkles", Icon: Sparkles },
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = SERVICE_ICONS[name]?.Icon ?? Camera;
  return <Icon className={className} strokeWidth={1.4} />;
}
