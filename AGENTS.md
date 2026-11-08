<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Public pages read all site content through one server function (`getSiteData` in `src/lib/site-data.functions.ts`) cached under one query key; owner edits invalidate that key. Why: one fetch keeps every page in sync with dashboard changes.
- Owner writes go straight from the browser client and are enforced by row-level security via `has_role(auth.uid(), 'admin')`. Why: no privileged server code needed; the database is the security boundary.
- The owner role is granted only by a database trigger when the owner email confirms its account. Why: roles must never come from client input.
- Uploaded media lives in a private storage bucket and is served through the `/media/$` server route (Range-aware). Why: public buckets are blocked in this workspace; the proxy gives stable, non-expiring URLs.
- Inquiries are not stored; the form builds a pre-filled WhatsApp message to the owner's number. Why: the owner chose WhatsApp as the destination.
