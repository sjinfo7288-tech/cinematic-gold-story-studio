import { useState } from "react";
import { CalendarClock, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, isOfferActive, type Offer } from "@/lib/site";
import { deleteMedia } from "@/lib/media-upload";
import { ConfirmDelete, errorMessage, FieldRow, ImageField, Panel, useRefreshSite } from "./shared";

type Draft = { id?: string; title: string; description: string; discount_percent: number; valid_until: string; image_url: string | null };

export function OffersTab({ offers }: { offers: Offer[] }) {
  const refresh = useRefreshSite();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [original, setOriginal] = useState<Offer | null>(null);
  const [busy, setBusy] = useState(false);
  const expired = offers.filter((o) => !isOfferActive(o));

  const openNew = () => {
    setOriginal(null);
    setDraft({ title: "", description: "", discount_percent: 10, valid_until: "", image_url: null });
  };
  const openEdit = (o: Offer) => {
    setOriginal(o);
    setDraft({ id: o.id, title: o.title, description: o.description, discount_percent: o.discount_percent, valid_until: o.valid_until ?? "", image_url: o.image_url });
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.title.trim()) { toast.error("Please enter an offer title."); return; }
    if (draft.discount_percent < 0 || draft.discount_percent > 100) { toast.error("Discount must be between 0 and 100%."); return; }
    setBusy(true);
    try {
      const row = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        discount_percent: Math.round(draft.discount_percent),
        valid_until: draft.valid_until || null,
        image_url: draft.image_url,
      };
      const { error } = draft.id
        ? await supabase.from("offers").update(row).eq("id", draft.id)
        : await supabase.from("offers").insert(row);
      if (error) throw error;
      if (original && original.image_url !== draft.image_url) await deleteMedia(original.image_url);
      await refresh();
      toast.success(draft.id ? "Offer updated." : "Offer published.");
      setDraft(null);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (o: Offer) => {
    const { error } = await supabase.from("offers").delete().eq("id", o.id);
    if (error) { toast.error(error.message); return; }
    await deleteMedia(o.image_url);
    await refresh();
    toast.success("Offer deleted.");
  };

  const removeExpired = async () => {
    const { error } = await supabase.from("offers").delete().in("id", expired.map((o) => o.id));
    if (error) { toast.error(error.message); return; }
    for (const o of expired) await deleteMedia(o.image_url);
    await refresh();
    toast.success("Expired offers deleted.");
  };

  return (
    <Panel
      title="Special offers"
      description="Visitors only see offers that haven't expired. Expired offers stay here until you delete them."
      actions={
        <div className="flex flex-wrap gap-2">
          {expired.length > 0 && (
            <ConfirmDelete what={`${expired.length} expired offer${expired.length > 1 ? "s" : ""}`} onConfirm={removeExpired}>
              <Button variant="outline"><Trash2 /> Delete expired</Button>
            </ConfirmDelete>
          )}
          <Button variant="gold" onClick={openNew}><Plus /> Create offer</Button>
        </div>
      }
    >
      {offers.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">No offers yet. Create your first one to show it on the Offers page.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {offers.map((o) => {
            const active = isOfferActive(o);
            return (
              <div key={o.id} className="flex overflow-hidden rounded-sm border border-border bg-ink/40">
                <div className="relative w-32 shrink-0 sm:w-40">
                  {o.image_url ? <img src={o.image_url} alt="" className="absolute inset-0 size-full object-cover" /> : <div className="absolute inset-0 bg-muted" />}
                  <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-primary-foreground">{o.discount_percent}%</span>
                </div>
                <div className="min-w-0 flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-2xl leading-tight">{o.title}</h3>
                    <Badge variant={active ? "default" : "destructive"}>{active ? "Live" : "Expired"}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{o.description}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-gold-soft">
                    <CalendarClock className="size-3.5" /> {o.valid_until ? `Valid till ${formatDate(o.valid_until)}` : "No expiry date"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <Button size="sm" variant="goldOutline" onClick={() => openEdit(o)}><Pencil /> Edit</Button>
                    <ConfirmDelete what={`“${o.title}”`} onConfirm={() => remove(o)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!draft} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-medium">{draft?.id ? "Edit offer" : "New offer"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-5">
              <FieldRow label="Offer title" htmlFor="ot">
                <Input id="ot" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Maternity Shoot Festive Offer" maxLength={100} />
              </FieldRow>
              <FieldRow label="Description" htmlFor="od">
                <Textarea id="od" rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={600} />
              </FieldRow>
              <div className="grid gap-5 sm:grid-cols-2">
                <FieldRow label="Discount (%)" htmlFor="op">
                  <Input id="op" type="number" min={0} max={100} value={draft.discount_percent} onChange={(e) => setDraft({ ...draft, discount_percent: Number(e.target.value) })} />
                </FieldRow>
                <FieldRow label="Valid until" htmlFor="ov" hint="Leave empty for no expiry.">
                  <Input id="ov" type="date" value={draft.valid_until} onChange={(e) => setDraft({ ...draft, valid_until: e.target.value })} />
                </FieldRow>
              </div>
              <ImageField label="Offer banner" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} folder="offers" />
              <Button variant="gold" size="lg" onClick={save} disabled={busy}>
                {busy && <Loader2 className="animate-spin" />} {draft.id ? "Save offer" : "Publish offer"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
