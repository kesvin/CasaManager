Maintenance scripts and secrets archive

- `scripts/` previously contained utility and maintenance scripts. Sensitive scripts that require the Supabase `service_role` key have been moved here.
- `maintenance/scripts/` — archived scripts that must be run manually on trusted hosts (they read `.env.local` and use `SUPABASE_SERVICE_ROLE_KEY`).
- `maintenance/secrets/` — backup of `.env.local` moved here. Keep this folder out of version control and rotate any exposed keys.

Usage:

Run scripts from the project root, for example:

```bash
node nextjs-app/maintenance/scripts/sync_app_users_with_auth.js
```

Security notes:
- Do NOT commit `maintenance/secrets/.env.local` to git. Rotate keys if they were committed previously.
