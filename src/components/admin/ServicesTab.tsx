import { useState } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_ICONS, ServiceIcon } from "@/lib/icons";
import type { Service } from "@/lib/site";
import { deleteMedia } from "@/lib/media-upload";
import { ConfirmDelete, errorMessage, FieldRow, ImageField, Panel, useRefreshSite } from "./shared";

type Draft = { id?: string; title: string; description: string; icon: string; image_url: string | null; sort_order: number };

export function ServicesTab({ services }: { services: Service[] }) {
  const refresh = useRefreshSite();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [original, setOriginal] = useState<Service | null>(null);
  const [busy, setBusy] = useState(false);

  const openNew = () => {
    setOriginal(null);
    setDraft({ title: "", description: "", icon: "camera", image_url: null, sort_order: services.length + 1 });
  };
  const openEdit = (s: Service) => {
    setOriginal(s);
    setDraft({ id: s.id, title: s.title, description: s.description, icon: s.icon, image_url: s.image_url, sort_order: s.sort_order });
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.title.trim()) return toast.error("Please enter a service title.");
    setBusy(true);
    try {
      const row = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        icon: draft.icon,
        image_url: draft.image_url,
        sort_order: draft.sort_order,
      };
      const { error } = draft.id
        ? await supabase.from("services").update(row).eq("id", draft.id)
        : await supabase.from("services").insert(row);
      if (error) throw error;
      if (original && original.image_url !== draft.image_url) await deleteMedia(original.image_url);
      await refresh();
      toast.success(draft.id ? "Service updated." : "Service added.");
      setDraft(null);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (s: Service) => {
    const { error } = await supabase.from("services").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    await deleteMedia(s.image_url);
    await refresh();
    toast.success("Service deleted.");
  };

  return (
    <Panel
      title="Services"
      description="Service cards on the website. Titles also appear in the inquiry form dropdown."
      actions={<Button variant="gold" onClick={openNew}><Plus /> Add service</Button>}
    >
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-sm border border-border bg-ink/40">
            <div className="relative aspect-video">
              {s.image_url ? <img src={s.image_url} alt="" className="size-full object-cover" /> : <div className="size-full bg-muted" />}
              <span className="absolute bottom-3 left-3 flex size-12 items-center justify-center rounded-full border border-gold/60 bg-ink text-gold">
                <ServiceIcon name={s.icon} className="size-6" />
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-2xl">{s.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <Button size="sm" variant="goldOutline" onClick={() => openEdit(s)}><Pencil /> Edit</Button>
                <ConfirmDelete what={`“${s.title}”`} onConfirm={() => remove(s)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-medium">{draft?.id ? "Edit service" : "New service"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-5">
              <FieldRow label="Title" htmlFor="st">
                <Input id="st" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={80} />
              </FieldRow>
              <FieldRow label="Short description" htmlFor="sd">
                <Textarea id="sd" rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={400} />
              </FieldRow>
              <div className="grid gap-5 sm:grid-cols-2">
                <FieldRow label="Icon">
                  <Select value={draft.icon} onValueChange={(v) => setDraft({ ...draft, icon: v })}>
                    <SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SERVICE_ICONS).map(([k, { label, Icon }]) => (
                        <SelectItem key={k} value={k}>
                          <span className="flex items-center gap-2"><Icon className="size-4 text-gold" /> {label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow label="Display order" htmlFor="so" hint="Lower numbers show first.">
                  <Input id="so" type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })} />
                </FieldRow>
              </div>
              <ImageField label="Service image" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} folder="services" />
              <Button variant="gold" size="lg" onClick={save} disabled={busy}>
                {busy && <Loader2 className="animate-spin" />} Save service
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
