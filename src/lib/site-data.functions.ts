import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Everything the public website shows. Read-only, published content only. */
export const getSiteData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [settings, galleries, photos, videos, services, offers] = await Promise.all([
    sb.from("site_settings").select("*").eq("id", 1).single(),
    sb.from("galleries").select("*").order("sort_order").order("created_at"),
    sb.from("photos").select("*").order("sort_order").order("created_at", { ascending: false }),
    sb.from("videos").select("*").order("sort_order").order("created_at", { ascending: false }),
    sb.from("services").select("*").order("sort_order").order("created_at"),
    sb.from("offers").select("*").order("valid_until", { ascending: true, nullsFirst: false }),
  ]);
  for (const r of [settings, galleries, photos, videos, services, offers]) {
    if (r.error) throw new Error(r.error.message);
  }
  return {
    settings: settings.data!,
    galleries: galleries.data ?? [],
    photos: photos.data ?? [],
    videos: videos.data ?? [],
    services: services.data ?? [],
    offers: offers.data ?? [],
  };
});
