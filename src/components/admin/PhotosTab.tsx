import { useRef, useState } from "react";
import { Eye, FolderPlus, ImagePlus, Loader2, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Lightbox } from "@/components/site/Lightbox";
import type { Gallery, Photo } from "@/lib/site";
import { deleteMedia, uploadMedia } from "@/lib/media-upload";
import { ConfirmDelete, errorMessage, FieldRow, Panel, useRefreshSite } from "./shared";

const NONE = "none";

export function PhotosTab({ photos, galleries }: { photos: Photo[]; galleries: Gallery[] }) {
  const refresh = useRefreshSite();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadGallery, setUploadGallery] = useState<string>(galleries[0]?.id ?? NONE);
  const [uploading, setUploading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [preview, setPreview] = useState<number | null>(null);
  const [newGallery, setNewGallery] = useState("");

  const shown = filter === "all" ? photos : photos.filter((p) => (filter === NONE ? !p.gallery_id : p.gallery_id === filter));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    try {
      for (let i = 0; i < list.length; i++) {
        setUploading(`Uploading ${i + 1} of ${list.length}…`);
        const f = list[i];
        const { url, path } = await uploadMedia(f, "photos");
        const title = f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
        const { error } = await supabase.from("photos").insert({
          url,
          storage_path: path,
          title,
          gallery_id: uploadGallery === NONE ? null : uploadGallery,
          in_slider: true,
          sort_order: 100,
        });
        if (error) throw error;
      }
      await refresh();
      toast.success(`${list.length} photo${list.length > 1 ? "s" : ""} uploaded.`);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setUploading(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addGallery = async () => {
    const name = newGallery.trim();
    if (!name) return;
    const { error } = await supabase.from("galleries").insert({ name, sort_order: galleries.length + 1 });
    if (error) return toast.error(error.message);
    setNewGallery("");
    await refresh();
    toast.success("Gallery created.");
  };

  return (
    <div className="space-y-6">
      <Panel title="Upload photos" description="Choose one or many photos from your phone or computer (max 50 MB each).">
        <div className="flex flex-wrap items-end gap-4">
          <FieldRow label="Add to gallery" className="min-w-[220px]">
            <Select value={uploadGallery} onValueChange={setUploadGallery}>
              <SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {galleries.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                <SelectItem value={NONE}>No gallery</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          <Button variant="gold" size="lg" onClick={() => fileRef.current?.click()} disabled={!!uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />} {uploading ?? "Choose photos"}
          </Button>
        </div>
      </Panel>

      <Panel title="Galleries" description="Group photos into collections shown as filters on the Gallery page.">
        <div className="space-y-3">
          {galleries.map((g) => (
            <GalleryRow key={g.id} gallery={g} count={photos.filter((p) => p.gallery_id === g.id).length} />
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Input value={newGallery} onChange={(e) => setNewGallery(e.target.value)} placeholder="New gallery name, e.g. Pre-Wedding" className="h-11 max-w-sm" maxLength={60} />
          <Button variant="goldOutline" size="lg" onClick={addGallery}><FolderPlus /> Create gallery</Button>
        </div>
      </Panel>

      <Panel
        title={`All photos (${photos.length})`}
        description="Edit titles, move photos between galleries, choose which appear in the home page slider, or delete."
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-10 w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All photos</SelectItem>
              {galleries.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              <SelectItem value={NONE}>No gallery</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        {shown.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">No photos here yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((p, i) => (
              <PhotoCard key={p.id} photo={p} galleries={galleries} onPreview={() => setPreview(i)} />
            ))}
          </div>
        )}
      </Panel>
      <Lightbox items={shown} index={preview} onIndex={setPreview} onClose={() => setPreview(null)} />
    </div>
  );
}

function GalleryRow({ gallery, count }: { gallery: Gallery; count: number }) {
  const refresh = useRefreshSite();
  const [name, setName] = useState(gallery.name);
  const dirty = name.trim() !== gallery.name;
  const save = async () => {
    const { error } = await supabase.from("galleries").update({ name: name.trim() }).eq("id", gallery.id);
    if (error) return toast.error(error.message);
    await refresh();
    toast.success("Gallery renamed.");
  };
  const remove = async () => {
    const { error } = await supabase.from("galleries").delete().eq("id", gallery.id);
    if (error) return toast.error(error.message);
    await refresh();
    toast.success("Gallery deleted. Its photos are kept under “No gallery”.");
  };
  return (
    <div className="flex items-center gap-2 rounded-sm border border-border bg-ink/40 p-2">
      <Pencil className="ml-2 size-4 shrink-0 text-gold" />
      <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 border-0 bg-transparent" maxLength={60} />
      <span className="shrink-0 text-xs text-muted-foreground">{count} photos</span>
      {dirty && <Button size="sm" variant="gold" onClick={save}><Save /> Save</Button>}
      <ConfirmDelete what={`the “${gallery.name}” gallery`} onConfirm={remove} />
    </div>
  );
}

function PhotoCard({ photo, galleries, onPreview }: { photo: Photo; galleries: Gallery[]; onPreview: () => void }) {
  const refresh = useRefreshSite();
  const [title, setTitle] = useState(photo.title);

  const update = async (patch: Partial<Photo>, msg = "Photo updated.") => {
    const { error } = await supabase.from("photos").update(patch).eq("id", photo.id);
    if (error) return toast.error(error.message);
    await refresh();
    toast.success(msg);
  };
  const remove = async () => {
    const { error } = await supabase.from("photos").delete().eq("id", photo.id);
    if (error) return toast.error(error.message);
    await deleteMedia(photo.storage_path);
    await refresh();
    toast.success("Photo deleted.");
  };

  return (
    <div className="overflow-hidden rounded-sm border border-border bg-ink/40">
      <button onClick={onPreview} className="group relative block aspect-[4/3] w-full overflow-hidden">
        <img src={photo.url} alt={photo.title} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute inset-0 flex items-center justify-center bg-ink/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Eye className="text-gold" />
        </span>
      </button>
      <div className="space-y-3 p-4">
        <div className="flex gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Photo title" className="h-10" maxLength={100} />
          {title !== photo.title && <Button size="icon" variant="gold" aria-label="Save title" onClick={() => update({ title: title.trim() }, "Title saved.")}><Save /></Button>}
        </div>
        <Select value={photo.gallery_id ?? NONE} onValueChange={(v) => update({ gallery_id: v === NONE ? null : v }, "Moved.")}>
          <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {galleries.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            <SelectItem value={NONE}>No gallery</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch checked={photo.in_slider} onCheckedChange={(v) => update({ in_slider: v }, v ? "Added to slider." : "Removed from slider.")} />
            Show in home slider
          </label>
          <ConfirmDelete what="this photo" onConfirm={remove} />
        </div>
      </div>
    </div>
  );
}
