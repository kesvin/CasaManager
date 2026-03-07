Supabase + Vercel Postgres integration (quick start)

Steps to provision services and configure this project:

1) Create a Supabase project
   - Go to https://supabase.com and create a new project.
   - In the Supabase dashboard -> Storage create a bucket named `documents`.
   - In Supabase Auth enable Email (magic link) in the Authentication settings.

2) Get Supabase credentials and add to Vercel
   - From Supabase Project Settings -> API copy `URL` and `anon/public` key.
   - From Supabase Project Settings -> Service API Keys copy the `service_role` key.
   - In your Vercel project Settings -> Environment Variables add (Production/Preview/Development):
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
     - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (server-only)

3) Provision Vercel Postgres
   - In the Vercel dashboard, provision Vercel Postgres for your project.
   - Copy the `DATABASE_URL` and add it to Vercel Environment Variables (Production/Preview/Development).

4) Install dependencies locally
   From `nextjs-app` run:
```powershell
npm install
```

5) Local testing
   - Create a local `.env.local` (do NOT commit) with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgres://...
```
   - Start dev server: `npm run dev`
   - Use the component `SupabaseAuthUpload` anywhere (import and render) to test auth and uploads.

Notes:
- This repo includes `lib/supabaseClient.js` and `lib/supabaseServer.js` helper files.
- Current `components/SupabaseAuthUpload.js` is an example only — adapt UI and storage rules for production.
- For security, keep `SUPABASE_SERVICE_ROLE_KEY` only in server env vars (Vercel). Do not expose it to the browser.

API authentication notes
- The server has a helper `lib/auth.js` that accepts a Supabase access token from `Authorization: Bearer <token>` and validates it using the `SUPABASE_SERVICE_ROLE_KEY`.
- When making requests to protected API routes (e.g., POST `/api/gastos`), include the user's access token in the `Authorization` header to have the server associate the request with the Supabase user.

Example (fetch with token):
```js
const token = 'user-access-token'
fetch('/api/gastos', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
   body: JSON.stringify({ amount: 12.34, description: 'Compra' })
})
```

