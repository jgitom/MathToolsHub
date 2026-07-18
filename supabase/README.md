# Supabase setup for MathToolsHub

The public browser configuration is already stored in `supabase-config.js`. It contains only the browser-safe publishable key. Never add a Supabase secret or `service_role` key to this repository.

## One-time database setup

1. Open the Supabase project dashboard.
2. Select **SQL Editor** and create a new query.
3. Copy all SQL from `supabase/schema.sql` into the editor.
4. Select **Run**.
5. Open **Database > Tables** and confirm `profiles` and `learning_progress` exist with RLS enabled.

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

Individual games and quizzes still use local storage. They can be migrated to `learning_progress` incrementally after the schema is installed.