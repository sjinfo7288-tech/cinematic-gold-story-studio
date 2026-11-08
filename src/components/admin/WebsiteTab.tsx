import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { SiteSettings } from "@/lib/site";
import { deleteMedia } from "@/lib/media-upload";
import { errorMessage, FieldRow, ImageField, Panel, useRefreshSite } from "./shared";

const TEXT_FIELDS: { key: keyof SiteSettings; label: string; long?: boolean }[] = [
  { key: "site_title", label: "Website title" },
  { key: "tagline", label: "Tagline (small text above the main heading)" },
  { key: "hero_title", label: "Main heading" },
  { key: "hero_subtitle", label: "Main heading subtitle", long: true },
  { key: "welcome_title", label: "Welcome heading" },
  { key: "welcome_text", label: "Welcome text", long: true },
  { key: "about_text", label: "About us text", long: true },
  { key: "footer_text", label: "Footer quote" },
];

export function WebsiteTab({ settings }: { settings: SiteSettings }) {
  const refresh = useRefreshSite();
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  useEffect(() => setForm(settings), [settings]);

  const save = async () => {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({
          site_title: form.site_title,
          tagline: form.tagline,
          hero_title: form.hero_title,
          hero_subtitle: form.hero_subtitle,
          welcome_title: form.welcome_title,
          welcome_text: form.welcome_text,
          about_text: form.about_text,
          footer_text: form.footer_text,
          logo_url: form.logo_url,
          hero_background_url: form.hero_background_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);
      if (error) throw error;
      // Clean up replaced uploads
      if (settings.logo_url !== form.logo_url) await deleteMedia(settings.logo_url);
      if (settings.hero_background_url !== form.hero_background_url) await deleteMedia(settings.hero_background_url);
      await refresh();
      toast.success("Website updated.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Panel title="Branding & background" description="Your logo and the large photo behind the home page.">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <ImageField label="Logo" value={form.logo_url} onChange={(v) => setForm({ ...form, logo_url: v })} folder="branding" aspect="aspect-square" />
          <ImageField label="Home page background" value={form.hero_background_url} onChange={(v) => setForm({ ...form, hero_background_url: v })} folder="branding" />
        </div>
      </Panel>

      <Panel title="Website text" description="Headings and paragraphs shown on the home page and footer.">
        <div className="grid gap-5 md:grid-cols-2">
          {TEXT_FIELDS.map((f) => (
            <FieldRow key={f.key} label={f.label} htmlFor={f.key} className={f.long ? "md:col-span-2" : undefined}>
              {f.long ? (
                <Textarea id={f.key} rows={3} value={String(form[f.key] ?? "")} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              ) : (
                <Input id={f.key} value={String(form[f.key] ?? "")} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              )}
            </FieldRow>
          ))}
        </div>
      </Panel>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button variant="gold" size="xl" onClick={save} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Save />} Save changes
        </Button>
      </div>
    </div>
  );
}
