# Clerkship Tools

Static site for GitHub Pages plus a Supabase backend (email login, saved progress, and a server function that calls Claude).

- `index.html` is the hub. Add a card per tool.
- `stem-coach/` is the Stem Coach tool.
- `config.js` holds the public Supabase URL and anon key.
- `supabase/schema.sql` creates the tables. Run it once in the Supabase SQL editor.
- `supabase/functions/coach/index.ts` is the server function. Deploy it with JWT verification off.

Secrets: set `ANTHROPIC_API_KEY` as a Supabase secret. Never put it in this repo.
Optional secrets: `USER_DAILY` (default 60), `GUEST_DAILY` (default 10).
