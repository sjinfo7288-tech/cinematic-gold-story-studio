import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { SiteSettings } from "@/lib/site";
import { errorMessage, FieldRow, Panel, useRefreshSite } from "./shared";

const schema = z.object({
  mobile: z.string().trim().regex(/^\+?[\d\s-]{10,15}$/, "Enter a valid mobile number"),
  whatsapp: z.string().trim().regex(/^\+?[\d\s-]{10,15}$/, "Enter a valid WhatsApp number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  instagram: z.string().trim().min(1, "Enter the Instagram username").max(60),
});

export function ContactTab({ settings }: { settings: SiteSettings }) {
  const refresh = useRefreshSite();
  const [form, setForm] = useState({ mobile: settings.mobile, whatsapp: settings.whatsapp, email: settings.email, instagram: settings.instagram });
  const [busy, setBusy] = useState(false);
  useEffect(() => setForm({ mobile: settings.mobile, whatsapp: settings.whatsapp, email: settings.email, instagram: settings.instagram }), [settings]);

  const save = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Please check the details."); return; }
    setBusy(true);
    try {
      const v = parsed.data;
      const { error } = await supabase
        .from("site_settings")
        .update({ ...v, instagram: v.instagram.replace(/^@/, ""), updated_at: new Date().toISOString() })
        .eq("id", 1);
      if (error) throw error;
      await refresh();
      toast.success("Contact details updated on the website.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Contact details" description="These appear on every page, on the Call, WhatsApp, Email and Instagram buttons, and receive inquiry messages.">
      <div className="grid gap-5 md:grid-cols-2">
        <FieldRow label="Mobile number" htmlFor="mobile" hint="Used for the Call Now button.">
          <Input id="mobile" type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        </FieldRow>
        <FieldRow label="WhatsApp number" htmlFor="whatsapp" hint="Inquiries are sent here. 10-digit Indian numbers work as-is.">
          <Input id="whatsapp" type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
        </FieldRow>
        <FieldRow label="Email address" htmlFor="email">
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </FieldRow>
        <FieldRow label="Instagram username" htmlFor="instagram">
          <Input id="instagram" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="sj_photography7288" />
        </FieldRow>
      </div>
      <div className="mt-8 flex justify-end">
        <Button variant="gold" size="lg" onClick={save} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Save />} Save contact details
        </Button>
      </div>
    </Panel>
  );
}
