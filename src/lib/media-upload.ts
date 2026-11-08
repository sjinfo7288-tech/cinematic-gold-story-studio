import { supabase } from "@/integrations/supabase/client";

export const MAX_UPLOAD_MB = 50;
const PREFIX = "/media/";

/** Uploads a file to the site media library and returns its public URL on this website. */
export async function uploadMedia(file: File, folder: string) {
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error(`This file is larger than ${MAX_UPLOAD_MB} MB. Please choose a smaller file.`);
  }
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || "file";
  const path = `${folder}/${crypto.randomUUID()}-${safe}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type || undefined,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return { url: `${PREFIX}${path}`, path };
}

export function storagePathFromUrl(url: string | null | undefined) {
  return url && url.startsWith(PREFIX) ? url.slice(PREFIX.length) : null;
}

/** Removes a file from the media library. Files that came with the site (not uploaded) are skipped. */
export async function deleteMedia(pathOrUrl: string | null | undefined) {
  const path = pathOrUrl?.startsWith(PREFIX) ? storagePathFromUrl(pathOrUrl) : pathOrUrl;
  if (!path) return;
  await supabase.storage.from("media").remove([path]);
}
