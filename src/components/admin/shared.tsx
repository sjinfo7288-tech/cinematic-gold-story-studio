import { useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { siteDataQuery } from "@/lib/site";
import { uploadMedia } from "@/lib/media-upload";
import { cn } from "@/lib/utils";

export function useRefreshSite() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: siteDataQuery.queryKey });
}

export function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong. Please try again.";
}

export function Panel({ title, description, children, actions }: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-sm border border-border bg-card p-5 md:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-medium">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function FieldRow({ label, htmlFor, children, hint, className }: { label: string; htmlFor?: string; children: ReactNode; hint?: string | undefined; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="font-caps text-[0.62rem] text-gold">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Image picker: upload from device or paste a link. Shows a live preview. */
export function ImageField({
  label,
  value,
  onChange,
  folder,
  aspect = "aspect-video",
}: {
  label: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder: string;
  aspect?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    setBusy(true);
    try {
      const { url } = await uploadMedia(file, folder);
      onChange(url);
      toast.success("Image uploaded — remember to save.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <FieldRow label={label}>
      <div className={cn("relative overflow-hidden rounded-sm border border-dashed border-gold/40 bg-ink", aspect)}>
        {value ? (
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">No image</div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/70">
            <Loader2 className="size-6 animate-spin text-gold" />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <Button type="button" variant="goldOutline" size="sm" onClick={() => ref.current?.click()} disabled={busy}>
          <ImageUp /> Upload image
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        )}
      </div>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} placeholder="…or paste an image link" className="text-xs" />
    </FieldRow>
  );
}

export function ConfirmDelete({ onConfirm, what, children }: { onConfirm: () => void; what: string; children?: ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button variant="ghost" size="icon" aria-label={`Delete ${what}`} className="text-destructive hover:bg-destructive/15 hover:text-destructive">
            <Trash2 />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {what}?</AlertDialogTitle>
          <AlertDialogDescription>This removes it from the website. This can't be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
