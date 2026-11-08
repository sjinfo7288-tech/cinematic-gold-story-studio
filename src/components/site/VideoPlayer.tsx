import { parseVideo } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Plays an uploaded video file, or embeds a YouTube / Vimeo link. */
export function VideoPlayer({
  url,
  title,
  className,
  ambient = false,
}: {
  url: string;
  title?: string | null;
  className?: string | undefined;
  /** Autoplay muted on loop, like a background reel. */
  ambient?: boolean;
}) {
  const v = parseVideo(url);
  if (v.kind === "file") {
    return (
      <video
        src={v.src}
        className={cn("size-full bg-ink object-cover", className)}
        playsInline
        preload="metadata"
        {...(ambient ? { autoPlay: true, muted: true, loop: true } : { controls: true })}
        aria-label={title ?? "Video"}
      />
    );
  }
  const src = ambient
    ? `${v.embed}${v.embed.includes("?") ? "&" : "?"}autoplay=1&mute=1&muted=1&loop=1&controls=0&playsinline=1`
    : v.embed;
  return (
    <iframe
      src={src}
      title={title ?? "Video"}
      className={cn("size-full bg-ink", className)}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      loading="lazy"
    />
  );
}
