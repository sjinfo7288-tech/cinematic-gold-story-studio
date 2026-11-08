import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/media/sj_logo.jpg.asset.json";

const OWNER_EMAIL = "sjinfo7288@gmail.com";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Owner Login — SJ Photography and Cinematic" },
      { name: "description", content: "Secure owner login for the SJ Photography and Cinematic website dashboard." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Owner Login — SJ Photography and Cinematic" },
      { property: "og:description", content: "Secure owner login for the website dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "forgot" | "setup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) { toast.error("Please enter a valid email address."); return; }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        navigate({ to: "/admin", replace: true });
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setNotice("If this is the owner email, a password reset link is on its way. Please check your inbox (and spam folder).");
      } else {
        if (cleanEmail !== OWNER_EMAIL) throw new Error("Only the owner email can create the dashboard account.");
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        if (password !== confirm) throw new Error("Passwords do not match.");
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        setNotice("Almost done! We sent a confirmation link to the owner email. Click it, then sign in here.");
        setMode("signin");
        setPassword("");
        setConfirm("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<Mode, string> = {
    signin: "Owner Login",
    forgot: "Reset password",
    setup: "First-time setup",
  };

  return (
    <div className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent),transparent_60%)] opacity-60" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
          <ArrowLeft className="size-4" /> Back to website
        </Link>
        <div className="rounded-sm border border-gold/30 bg-card p-8 shadow-gold md:p-10">
          <img src={logoAsset.url} alt="SJ logo" className="mx-auto size-24 rounded-full border border-gold/40 object-cover" />
          <h1 className="mt-6 text-center text-4xl font-medium">{titles[mode]}</h1>
          <p className="mt-2 flex items-center justify-center gap-2 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <LockKeyhole className="size-3.5 text-gold" /> Secure dashboard access
          </p>

          {notice && <p className="mt-6 rounded-sm border border-gold/30 bg-accent p-4 text-sm text-accent-foreground">{notice}</p>}

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" className="h-12" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@email.com" required />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete={mode === "setup" ? "new-password" : "current-password"} className="h-12" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            )}
            {mode === "setup" && (
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" autoComplete="new-password" className="h-12" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>
            )}
            <Button type="submit" variant="gold" size="xl" className="w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {mode === "signin" ? "Sign in" : mode === "forgot" ? "Send reset link" : "Create owner account"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-sm">
            {mode === "signin" ? (
              <>
                <button className="text-gold hover:underline" onClick={() => setMode("forgot")}>Forgot password?</button>
                <button className="text-muted-foreground hover:text-gold" onClick={() => setMode("setup")}>First time here? Set up the owner account</button>
              </>
            ) : (
              <button className="text-gold hover:underline" onClick={() => setMode("signin")}>Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
