# Third Shot showcase deployment

Current branch: `showcase/index` (default theme: `index`). All four showcase
branches contain the same application and Third Shot branding; each defaults to
its own theme in Next.js, Storybook, and Docker.

| Frontend branch      | Default theme | Suggested site URL                    |
| -------------------- | ------------- | ------------------------------------- |
| `showcase/court`     | `court`       | `https://court.thirdshot.example`     |
| `showcase/clubhouse` | `clubhouse`   | `https://clubhouse.thirdshot.example` |
| `showcase/coastal`   | `coastal`     | `https://coastal.thirdshot.example`   |
| `showcase/index`     | `index`       | `https://index.thirdshot.example`     |

All `.example` domains below are placeholders. Replace them with your own HTTPS
URLs. Use one shared API such as `https://api.thirdshot.example/api/pickleball/v1` and one
**dedicated pickleball MongoDB database** for all four sites. Orders and inventory
are shared across the four demos. Keep the existing clothing database separate.

## 1. Prepare the shared API and data first

In the backend repository, use `develop` with `MONGO_DATABASES=pickleball:thirdshot_pb`
(the same MongoDB cluster as `MONGO_URI`). Seed `thirdshot_pb` using
`SEED_PROFILE=pickleball`, then confirm these URLs return data:

- `https://api.thirdshot.example/api/pickleball/v1/products` (35 public products)
- `https://api.thirdshot.example/api/pickleball/v1/categories` (7 categories)
- `https://api.thirdshot.example/api/pickleball/v1/banners` (3 banners)

The fixture includes 36 products; one intentionally has no active variant and is
excluded from the public catalog. The API must be reachable **during frontend
builds** as well as at runtime; building against an unavailable API can cache an
empty homepage. Google Fonts and Unsplash images also require network access.

Set backend `WEB_URL` to one primary frontend URL (for example Court), and
`CORS_ORIGINS` to all four exact frontend origins, comma-separated. `WEB_URL`
is also used in email and OAuth redirects. Use frontend/API custom subdomains
under the same registrable domain for reliable guest-session cookies; unrelated
provider domains can be blocked by browsers' third-party-cookie policies.

## 2. Create four frontend services on your current host

Push the prepared branches yourself when ready. Connect one service per branch,
with this repository as its root and Node.js 24. This is a Next.js server app;
use the host's Next.js support or a Node/container service.

For each service set these **build-time** environment variables:

```dotenv
NEXT_PUBLIC_SHOWCASE_API_URL=https://api.thirdshot.example/api/pickleball/v1
NEXT_PUBLIC_SITE_URL=https://court.thirdshot.example
```

Change the site URL per service. Leave `THEME` unset to use the branch default;
remove stale hosting settings such as `THEME=rosier` or `NEXT_PUBLIC_BRAND_NAME=CLOTHES`.
Optional branding overrides are listed in `.env.example`. `NEXT_PUBLIC_*` values
are public and embedded into the bundle; never put secrets in them. The showcase
URL takes precedence over `NEXT_PUBLIC_API_URL` (supported as a fallback). Rebuild after
changing these settings. Configure the same values for build and runtime.

Install: `npm ci --include=dev` (the build needs devDependencies).
Build: `npm run build`.
Start: `node node_modules/next/dist/bin/next start` (honors the host's `PORT`).
For a manual local production start use `node node_modules/next/dist/bin/next start --port 3140`.
The existing `npm start` script uses fixed port 3030.

For local development copy `.env.example` to `.env.local` and change API/site URLs
to your local API and `http://localhost:3030`. This file is ignored by Git. Keep
real environment files out of commits and out of Docker build contexts.

## 3. Container alternative

From the desired branch (example: Court), after the API is online:

```sh
docker build -t thirdshot-court --build-arg NEXT_PUBLIC_SHOWCASE_API_URL=https://api.thirdshot.example/api/pickleball/v1 --build-arg NEXT_PUBLIC_SITE_URL=https://court.thirdshot.example .
docker run -d --name thirdshot-court -p 3140:3001 --restart unless-stopped thirdshot-court
```

Use unique image/container names for the other branches, with ports 3141, 3142,
and 3143 on a shared VPS. Put your HTTPS reverse proxy in front of those ports.
Containers run as an unprivileged user; `PORT` defaults to 3001. If changing
container `PORT`, change the port mapping too. The branch's Docker `THEME`
default matches Next.js; an explicit override must be supplied **at build time**
with `--build-arg THEME=...`, not changed after the image is built.

Use this `Dockerfile`; it includes `public`, runtime config, and theme files.
The old compose service and `develop` GitHub workflow target the existing single
clothing deployment. Create four services manually on your host for this showcase.

## 4. Before sharing the demo

1. Confirm each site's wordmark/title says Third Shot and its theme differs.
2. Open home, collection, a product, cart, and checkout on each live URL.
3. Add a product as a guest, refresh, and confirm the cart survives. Check CORS and
   cookie settings if the cart does not persist.
4. Confirm each site's sitemap/robots/canonical URLs use its own real hostname.
5. Verify account login and order lookup. Email, Google OAuth, and payOS QR need
   their own real backend service credentials; demo placeholders do not enable them.
6. Keep the backend seed command manual. Rerunning it resets fixture credentials
   and stock; rotate demo administrator credentials before exposing the admin API.

No remote branches, hosting services, database, DNS, or payment settings are
created by this preparation. Deploy these yourself when ready.
