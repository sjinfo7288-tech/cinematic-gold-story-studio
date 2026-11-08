import { createFileRoute } from "@tanstack/react-router";

// Serves the owner's uploaded photos and videos (public website content) from the
// private media library. Forwards Range so videos can stream and seek.
export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const path = params._splat ?? "";
        if (!path || path.includes("..") || !/^[\w\-./]+$/.test(path) || path.length > 300) {
          return new Response("Not found", { status: 404 });
        }
        const base = process.env["SUPABASE_URL"]!.replace(/\/+$/, "");
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const headers = new Headers({ apikey: key });
        const range = request.headers.get("range");
        if (range) headers.set("range", range);

        const upstream = await fetch(
          `${base}/storage/v1/object/authenticated/media/${path.split("/").map(encodeURIComponent).join("/")}`,
          { headers },
        );
        if (!upstream.ok && upstream.status !== 206) {
          return new Response("Not found", { status: 404 });
        }
        const out = new Headers();
        for (const h of ["content-type", "content-length", "content-range", "etag", "last-modified"]) {
          const v = upstream.headers.get(h);
          if (v) out.set(h, v);
        }
        out.set("accept-ranges", "bytes");
        out.set("cache-control", "public, max-age=31536000, immutable");
        return new Response(upstream.body, { status: upstream.status, headers: out });
      },
    },
  },
});
