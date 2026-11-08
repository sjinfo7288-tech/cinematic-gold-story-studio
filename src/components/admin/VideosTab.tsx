import { useRef, useState } from "react";
import { Link2, Loader2, Save, Star, Upload } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import type { SiteSettings, Video } from "@/lib/site";
import { deleteMedia, MAX_UPLOAD_MB, uploadMedia } from "@/lib/media-upload";
import { ConfirmDelete, errorMessage, FieldRow, Panel, useRefreshSite } from "./shared";

export function VideosTab({ videos, settings }: { videos: Video[]; settings: SiteSettings }) {
  const refresh = useRefreshSite();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [link, setLink] = useState("");

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) return toast.error("Please choose a video file.");
    setBusy(true);
    try {
      const { url, path } = await uploadMedia(file, "videos");
      const { error } = await supabase.from("videos").insert({
        url,
        storage_path: path,
        title: title.trim() || file.name.replace(/\.[^.]+$/, ""),
        source: "upload",
        sort_order: 100,
      });
      if (error) throw error;
      setTitle("");
      await refresh();
      toast.success("Video uploaded.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addLink = async () => {
    const url = link.trim();
    if (!/^https?:\/\/\S+$/.test(url)) return toast.error("Please paste a full video link starting with https://");
    const { error } = await supabase.from("videos").insert({ url, title: linkTitle.trim() || "Video", source: "link", sort_order: 100 });
    if (error) return toast.error(error.message);
    setLink("");
    setLinkTitle("");
    await refresh();
    toast.success("Video link added.");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Upload a video" description={`MP4 or MOV, up to ${MAX_UPLOAD_MB} MB. For longer films, add a YouTube link instead.`}>
          <div className="space-y-4">
            <FieldRow label="Video title" htmlFor="vt">
              <Input id="vt" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Wedding Highlights" maxLength={100} />
            </FieldRow>
            <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
            <Button variant="gold" size="lg" onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Upload />} {busy ? "Uploading… please wait" : "Choose video"}
            </Button>
          </div>
        </Panel>
        <Panel title="Add a video link" description="YouTube, Vimeo or a direct video link.">
          <div className="space-y-4">
            <FieldRow label="Video title" htmlFor="lt">
              <Input id="lt" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} maxLength={100} />
            </FieldRow>
            <FieldRow label="Link" htmlFor="ll">
              <Input id="ll" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://youtube.com/watch?v=…" />
            </FieldRow>
            <Button variant="goldOutline" size="lg" onClick={addLink}><Link2 /> Add link</Button>
          </div>
        </Panel>
      </div>

      <Panel title={`Videos (${videos.length})`} description="The featured video plays on the home page.">
        {videos.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">No videos yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} featured={settings.featured_video_url === v.url} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function VideoCard({ video, featured }: { video: Video; featured: boolean }) {
  const refresh = useRefreshSite();
  const [title, setTitle] = useState(video.title);

  const setFeatured = async () => {
    const { error } = await supabase.from("site_settings").update({ featured_video_url: video.url }).eq("id", 1);
    if (error) return toast.error(error.message);
    await refresh();
    toast.success("Featured video changed.");
  };
  const saveTitle = async () => {
    const { error } = await supabase.from("videos").update({ title: title.trim() }).eq("id", video.id);
    if (error) return toast.error(error.message);
    await refresh();
    toast.success("Title saved.");
  };
  const remove = async () => {
    const { error } = await supabase.from("videos").delete().eq("id", video.id);
    if (error) return toast.error(error.message);
    if (featured) await supabase.from("site_settings").update({ featured_video_url: null }).eq("id", 1);
    await deleteMedia(video.storage_path);
    await refresh();
    toast.success("Video deleted.");
  };

  return (
    <div className="overflow-hidden rounded-sm border border-border bg-ink/40">
      <div className="relative aspect-video bg-ink">
        <VideoPlayer url={video.url} title={video.title} className="object-contain" />
        {featured && <Badge className="absolute left-3 top-3 bg-gold text-primary-foreground"><Star className="mr-1 size-3" /> Featured</Badge>}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-10" maxLength={100} />
          {title !== video.title && <Button size="icon" variant="gold" aria-label="Save title" onClick={saveTitle}><Save /></Button>}
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button size="sm" variant={featured ? "secondary" : "goldOutline"} onClick={setFeatured} disabled={featured}>
            <Star /> {featured ? "Featured on home" : "Make featured"}
          </Button>
          <ConfirmDelete what="this video" onConfirm={remove} />
        </div>
      </div>
    </div>
  );
}
