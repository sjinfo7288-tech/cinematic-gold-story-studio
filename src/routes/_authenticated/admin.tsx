import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Gift, Globe, Images, Loader2, LogOut, Phone, ShieldAlert, Sparkles, UserCog, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { siteDataQuery } from "@/lib/site";
import { WebsiteTab } from "@/components/admin/WebsiteTab";
import { PhotosTab } from "@/components/admin/PhotosTab";
import { VideosTab } from "@/components/admin/VideosTab";
import { ServicesTab } from "@/components/admin/ServicesTab";
import { OffersTab } from "@/components/admin/OffersTab";
import { ContactTab } from "@/components/admin/ContactTab";
import { AccountTab } from "@/components/admin/AccountTab";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard — SJ Photography and Cinematic" },
      { name: "description", content: "Manage the SJ Photography and Cinematic website." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Owner Dashboard — SJ Photography and Cinematic" },
      { property: "og:description", content: "Manage website content, photos, videos, services and offers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { value: "website", label: "Website", icon: Globe },
  { value: "photos", label: "Photos", icon: Images },
  { value: "videos", label: "Videos", icon: Video },
  { value: "services", label: "Services", icon: Sparkles },
  { value: "offers", label: "Offers", icon: Gift },
  { value: "contact", label: "Contact", icon: Phone },
  { value: "account", label: "Account", icon: UserCog },
] as const;

function AdminPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const role = useQuery({
    queryKey: ["is-owner", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
  const site = useQuery({ ...siteDataQuery, enabled: role.data === true });

  const logout = async () => {
    await qc.cancelQueries();
    qc.removeQueries({ queryKey: ["is-owner"] });
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (role.isLoading) return <FullScreen><Loader2 className="size-8 animate-spin text-gold" /></FullScreen>;

  if (!role.data) {
    return (
      <FullScreen>
        <div className="max-w-md rounded-sm border border-gold/30 bg-card p-8 text-center">
          <ShieldAlert className="mx-auto size-10 text-gold" />
          <h1 className="mt-4 text-3xl">Owner access only</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You're signed in as {user.email}, which isn't the owner account. Only the owner can manage this website.
          </p>
          <Button variant="gold" className="mt-6" onClick={logout}><LogOut /> Log out</Button>
        </div>
      </FullScreen>
    );
  }

  const data = site.data;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {data?.settings.logo_url && <img src={data.settings.logo_url} alt="" className="size-10 rounded-full border border-gold/40 object-cover" />}
            <div className="min-w-0">
              <p className="truncate font-caps text-xs text-gold">Owner Dashboard</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="goldOutline" size="sm">
              <Link to="/" target="_blank"><ExternalLink /> <span className="hidden sm:inline">View website</span></Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut /> <span className="hidden sm:inline">Log out</span></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="text-4xl font-medium md:text-5xl">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Changes you save here appear on the public website right away.</p>

        {!data ? (
          <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-gold" /></div>
        ) : (
          <Tabs defaultValue="website" className="mt-8">
            <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-card p-1">
              {TABS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="gap-2 px-4 py-2 data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
                  <Icon className="size-4" /> {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="mt-6">
              <TabsContent value="website"><WebsiteTab settings={data.settings} /></TabsContent>
              <TabsContent value="photos"><PhotosTab photos={data.photos} galleries={data.galleries} /></TabsContent>
              <TabsContent value="videos"><VideosTab videos={data.videos} settings={data.settings} /></TabsContent>
              <TabsContent value="services"><ServicesTab services={data.services} /></TabsContent>
              <TabsContent value="offers"><OffersTab offers={data.offers} /></TabsContent>
              <TabsContent value="contact"><ContactTab settings={data.settings} /></TabsContent>
              <TabsContent value="account"><AccountTab email={user.email ?? ""} onLogout={logout} /></TabsContent>
            </div>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4">{children}</div>;
}
