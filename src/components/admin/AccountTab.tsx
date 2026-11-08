import { useState } from "react";
import { KeyRound, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { errorMessage, FieldRow, Panel } from "./shared";

export function AccountTab({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) return toast.error("New password must be at least 8 characters.");
    if (next !== confirm) return toast.error("New passwords do not match.");
    setBusy(true);
    try {
      // Confirm the current password before changing it.
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password: current });
      if (authErr) throw new Error("Your current password is incorrect.");
      const attrs: Parameters<typeof supabase.auth.updateUser>[0] & { current_password?: string } = {
        password: next,
        current_password: current,
      };
      const { error } = await supabase.auth.updateUser(attrs);
      if (error) throw error;
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password changed.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Change password" description={`Signed in as ${email}`}>
        <form onSubmit={change} className="space-y-4">
          <FieldRow label="Current password" htmlFor="cur">
            <Input id="cur" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </FieldRow>
          <FieldRow label="New password" htmlFor="new" hint="At least 8 characters.">
            <Input id="new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
          </FieldRow>
          <FieldRow label="Confirm new password" htmlFor="con">
            <Input id="con" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </FieldRow>
          <Button type="submit" variant="gold" size="lg" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <KeyRound />} Update password
          </Button>
        </form>
      </Panel>
      <Panel title="Sign out" description="Securely ends your session on this device. You'll need your password next time you sign in.">
        <Button variant="goldOutline" size="lg" onClick={onLogout}>
          <LogOut /> Log out
        </Button>
      </Panel>
    </div>
  );
}
