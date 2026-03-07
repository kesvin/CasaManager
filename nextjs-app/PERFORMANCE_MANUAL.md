Performance manual — Proyecto CasaManager

1) Purpose
- This document explains the app structure, where it connects to the database, and concrete steps to improve performance and reduce payload sizes.

2) Project structure (relevant)
- components/  — React UI components
- contexts/    — client state providers (GastosContext, SupabaseAuth)
- lib/         — helpers: `supabaseClient.js`, `supabaseServer.js`, `db.js`, `data.js`
- pages/       — Next.js pages (server/client routes)
- public/      — static assets (images, `public/videos/hero-particles.mp4`)
- db/migrations/ — SQL migration files (001_init_tables.sql, 002_app_tables.sql)
- scripts/     — utilities (migrations, import, seed, checks)
- .env.local   — runtime secrets (NOT committed)

3) Where the app connects to the DB
- Environment variables (in `nextjs-app/.env.local`):
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (public)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key for client operations
  - `SUPABASE_SERVICE_ROLE_KEY` — Service role key (server-only, powerful; do not commit)
  - `DATABASE_URL` — direct Postgres connection string (used by migration runner)

- Server-side DB access points:
  - `lib/supabaseServer.js` — creates `supabaseAdmin` using `SUPABASE_SERVICE_ROLE_KEY` for admin operations
  - `lib/db.js` — lightweight `pg` wrapper (if present) that connects using `DATABASE_URL`
  - API routes under `pages/api/*` use `supabaseAdmin` or verify tokens and operate server-side

4) Quick optimization changes already applied
- `next.config.js` updated: `swcMinify: true`, `experimental.optimizeCss: true`, and `images.domains` allows Supabase storage domain to be used with `next/image`.
- Added `scripts/check_secrets.js` and `package.json` script `check:secrets` to detect tracked secrets.

5) Immediate actionable optimization checklist
- Static assets
  - Move large assets out of `public/` (or into an object storage/CDN) and serve via CDN. In particular `public/videos/hero-particles.mp4` is large — convert to webm (VP9/AV1) and/or reduce bitrate.
  - Prefer optimized `webp`/`avif` for images. Use `cwebp`/`avif` or an image processing pipeline.
- Images in React
  - Replace plain `<img>` with `next/image` where appropriate to enable automatic optimization and responsive sizes.
  - Add `sizes` props and avoid loading large images at large resolutions.
- Video
  - Do not autoplay large videos on first paint. Use a lightweight poster image and lazy-load via IntersectionObserver.
  - Transcode `mp4` to `webm` and provide multiple sources. Example `ffmpeg` command:
    ffmpeg -i hero-particles.mp4 -c:v libvpx-vp9 -b:v 500k -crf 30 hero-particles.webm
  - Serve videos from CDN or Supabase Storage with proper caching headers.
- JavaScript
  - Use dynamic imports for heavy components: `const Heavy = dynamic(() => import('../components/Heavy'))`
  - Remove unused client-side code and move logic to server when possible.
  - Audit bundle with `next build` + analyzer (example below).
- CSS
  - Tailwind is configured; ensure `tailwind.config.js` `content` contains all used paths (it does).
  - Enable PurgeCSS (Tailwind does this in production build) and keep classes deterministic.
- Caching & CDN
  - On Vercel, static files are cached. For Supabase Storage, set appropriate cache-control headers when uploading files.
  - Use `stale-while-revalidate` techniques for API responses where acceptable.

6) Commands to analyze and rebuild (run locally)
- Build and run bundle analyzer (install `@next/bundle-analyzer` first):
```bash
npm install --save-dev @next/bundle-analyzer
# then add to next.config.js (manual) to wrap config and run:
ANALYZE=true npm run build
```
- Run Next.js production build and start (locally):
```bash
npm run build
npm start
```

7) Asset optimization examples
- Convert png/jpeg to webp (requires `cwebp` from libwebp):
```bash
cwebp -q 80 input.jpg -o output.webp
```
- Transcode video to webm (ffmpeg):
```bash
ffmpeg -i hero-particles.mp4 -c:v libvpx-vp9 -b:v 400k -crf 30 hero-particles.webm
```
- Generate responsive images (ImageMagick):
```bash
convert input.jpg -resize 800x output-800.jpg
```

8) Deployment checklist
- Ensure `.env.local` on deployment platform (Vercel) is set with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` (server env only). Do not commit keys.
- Apply DB migrations (two options):
  - Locally run `node scripts/run_migrations.js "$DATABASE_URL"`
  - Or paste `db/migrations/*.sql` into Supabase SQL editor and execute
- Seed data (optional): `node scripts/seed_examples.js`

9) Further improvements (next phase)
- Add CI job to run `npm run check:secrets` and bundle analyzer on PRs
- Add image optimization pipeline (serverless function or CI step) to resize and upload processed images to storage
- Implement server-side caching and RLS policies for secure, optimized queries
- Consider using edge functions or incremental static regeneration (ISR) for heavy-read pages

10) Files I added/modified
- `next.config.js` (enabled swcMinify, images.domains, optimizeCss)
- `scripts/check_secrets.js` (secret scanner)
- `scripts/seed_examples.js` (seeding utility)
- `scripts/list_gastos.js` (small helper)

If you want, I can now:
- apply specific code changes (convert `<img>` to `next/image` in chosen pages),
- transcode `public/videos/hero-particles.mp4` to webm locally (requires `ffmpeg` installed on your machine),
- add a GitHub Action to run `check:secrets` and `next build` on PRs.

Tell me which of the follow-up tasks to do next: transcode video, convert images to `next/image`, add CI check, or run bundle analysis locally? I can perform repo edits here; heavy local operations (ffmpeg, builds) are best run on your machine. 