# Supabase setup for MathToolsHub

The public browser configuration is already stored in `supabase-config.js`. It contains only the browser-safe publishable key. Never add a Supabase secret or `service_role` key to this repository.

## One-time database setup

1. Open the Supabase project dashboard.
2. Select **SQL Editor** and create a new query.
3. Copy all SQL from `supabase/schema.sql` into the editor and select **Run**.
4. Create another query using `supabase/catalogue.sql` and select **Run**.
5. Open **Database > Tables** and confirm `profiles`, `learning_progress`, and `catalogue_items` exist with RLS enabled.

## Authentication URL setup

In **Authentication > URL Configuration** set:

- Site URL: `https://mathtoolshub.com`
- Redirect URL: `https://mathtoolshub.com/account.html`

For local testing, also add `http://127.0.0.1:8000/account.html` or the exact local server URL being used.

## Current capabilities

- Email registration and sign-in through `account.html`
- Persistent browser sessions
- Automatic profile creation after registration
- Per-user profiles protected by Row Level Security
- Per-user learning progress table protected by Row Level Security

Games and quizzes keep fast local saves while `supabase-progress.js` synchronises connected activities to `learning_progress`.

## Database-driven catalogue

Run `supabase/catalogue.sql` once in the SQL Editor. Afterwards, manage catalogue rows in **Table Editor > catalogue_items**. The built-in HTML remains as an automatic fallback.
## Private downloadable content

1. Run `supabase/protected-storage.sql` in **SQL Editor**. It creates the private `protected-content` bucket and Storage RLS policies.
2. Open **Storage > protected-content** and create an `ebooks` folder.
3. Upload the repository PDFs using these exact object paths:
   - `ebooks/mula-mengguna-notebooklm.pdf`
   - `ebooks/cara-kerja-ai.pdf`
4. The ebook page uses these private object paths through `protected-assets.js`; the former public repository copies have been removed.

Authenticated visitors receive signed links that expire after 120 seconds. Do not put a `service_role` key in browser code.

Authenticated accounts receive access through 31 July 2026 via `profiles.content_access_until`. After the promotion, extend this timestamp for paid subscribers; administrators retain access.
