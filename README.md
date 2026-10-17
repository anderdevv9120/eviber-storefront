## Getting Started

First, install necessary packages:

```bash
yarn
```

Second, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3030](http://localhost:3030) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


<!-- Security scan triggered at 2025-09-02 05:27:59 -->

<!-- Security scan triggered at 2025-09-02 16:13:05 -->

## Pickleball demo

The six build-time themes are `classic`, `rosier` (clothing), and `court`,
`clubhouse`, `coastal`, `index` (Third Shot pickleball). `rosier` is the default.
One checkout runs one theme at a time: changing `THEME` requires restarting the
dev server or rebuilding production. Stop the current dev server before switching.

First follow [the backend pickleball setup](../backend/README.md#pickleball-demo)
to seed a **separate** MongoDB database and start its storefront API on port 3109.
Keep the clothing API/database separate; the seed guard rejects mixed catalogs.
The existing local demo may use `thirdshot_pb` rather than `thirdshot`; point that
API's `MONGO_URI` at the database you seeded.

From `frontend`, configure PowerShell for Third Shot:

```powershell
$env:THEME = 'court' # court | clubhouse | coastal | index
$env:NEXT_PUBLIC_API_URL = 'http://localhost:3109/api/v1'
$env:NEXT_PUBLIC_BRAND_NAME = 'Third Shot'
$env:NEXT_PUBLIC_BRAND_TAGLINE = 'Đồ pickleball chính hãng cho mọi trình độ'
$env:NEXT_PUBLIC_BRAND_DESCRIPTION = 'Vợt, bóng, giày và trang phục pickleball chính hãng — tư vấn chọn vợt tận tình, giao nhanh toàn quốc.'
npm run dev
```

Open [http://localhost:3030](http://localhost:3030). Shell variables override
`.env.local`; `.env.example` lists the supported settings. `NEXT_PUBLIC_*` values
are embedded at build time, so brand/API changes also need a restart or rebuild.
Remote Unsplash images and Google Fonts need network access.

Build and serve one variant with the same environment:

```powershell
npm run build
npm run start # http://localhost:3030
```

To validate all four demo builds (stop any dev server first):

```powershell
foreach ($themeName in 'court', 'clubhouse', 'coastal', 'index') {
  $env:THEME = $themeName
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "Build failed: $themeName" }
}
```

Each build replaces the checkout's `.next` output. Use separate checkouts and
ports to serve several themes simultaneously; there is no runtime theme switch.
For the clothing storefront and its E2E suite, restore the clothing API and defaults:

```powershell
$env:THEME = 'rosier' # or classic
$env:NEXT_PUBLIC_API_URL = 'http://localhost:3009/api/v1'
Remove-Item Env:NEXT_PUBLIC_BRAND_NAME, Env:NEXT_PUBLIC_BRAND_TAGLINE, Env:NEXT_PUBLIC_BRAND_DESCRIPTION -ErrorAction SilentlyContinue
npm run dev
# In another terminal with the same clothing environment:
# npm run test:e2e
```

Unset brand values in `.env.local` too if you placed them there. E2E global setup
runs the clothing seed, so its backend `MONGO_URI` must point at the clothing demo
DB. In the E2E terminal, set `MONGO_URI` to the same local clothing replica-set URI
used by both API processes; this overrides `backend/.env`. Do not run the suite
against the pickleball DB. Set `E2E_BROWSER_CHANNEL=chrome`
when using installed Chrome instead of Playwright's downloaded Chromium.
