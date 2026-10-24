# CLAUDE.md — frontend

> Conventions chung toàn workspace (multi-repo, ngôn ngữ, skill routing) → `../CLAUDE.md` (root).
> File này chỉ chứa những gì riêng của repo frontend.

## Project Overview

Storefront e-commerce cho khách hàng cuối (thị trường Việt Nam — địa giới hành chính 2 cấp 34 tỉnh/thành → phường/xã từ `src/constants/address/`, JSON gen bằng `scripts/gen-address-data.mjs` chạy `node` trực tiếp, không phải package npm). Next.js 14 App Router, SSR + SEO (sitemap/robots là route native sinh lúc request). Flow chính: duyệt collection/product → cart → checkout → theo dõi đơn trong `/user`.

## Tech Stack Notes

Chi tiết root chưa ghi:

- **Form**: react-hook-form + `@hookform/resolvers` + yup (schema viết INLINE trong form component; `constants/validate.ts` chỉ chứa message constants + regex)
- **UI phụ trợ**: `class-variance-authority` (variants), `react-toastify` (qua `utils/toast.ts`), `react-swipeable` + `useCustomSwipeable`, `sass` (SCSS modules song song Tailwind)
- **State**: Zustand store dùng middleware `immer` (`useAppStore`)
- **Auth phía client**: token trong cookie (`js-cookie`), axios tự gắn Bearer + tự refresh
- **SEO**: sitemap + robots là `src/app/sitemap.ts` / `src/app/robots.ts` (native App Router, sitemap lặp API product theo trang, `revalidate` 1 giờ — KHÔNG có bước postbuild); checklist SEO per màn → rule `seo-nextjs` (`.claude/rules/` ở workspace root, auto-load khi chạm `src/app/`)
- **Storybook**: config tại `storybook/` (main.ts, preview, decorators, mocks — KHÔNG phải `.storybook/` mặc định); stories gom tập trung, không co-located

## Architecture

```
src/
├── app/                    # App Router
│   ├── (auth)/             # login, register, forget/new-password, verify-email, google-callback
│   │   └── */_component/   # component riêng của từng route — pattern chuẩn của repo
│   ├── (main)/             # layout chính (Header/Footer)
│   │   ├── (payment)/      # cart, checkout, payment-success
│   │   ├── collection/  product/[slug]/  user/  [...not-found]/
│   ├── api/auth/           # route handler phía Next (set/get token server-side)
│   └── ui-kits/            # gallery component nội bộ (chỉ dev — layout.tsx notFound() ở production)
├── apis/                   # gọi API theo domain: auth, cart, home, order, product, profile
├── config/
│   ├── axios.ts            # axios instance DUY NHẤT: Bearer từ cookie, refresh-token
│   │                       #   single-flight (isRefreshing + subscribers), qs serializer
│   └── utils.ts            # cn() = clsx + tailwind-merge
├── components/
│   ├── ui/                 # 30+ primitives (Button cva, Modal, Input*, Selector, Carousel...)
│   ├── organisms/          # khối lớn (Authentication, PageNotFound)
│   └── icons/              # icon components — check ở đây trước khi thêm icon mới
├── layouts/                # Header/ (phần dùng chung: SearchBox, UserAction...), Footer
├── themes/                 # theme chọn lúc build qua env THEME (mặc định rosier): classic/ (Pine cũ), rosier/ (Atelier Rosier)
│                           #   mỗi theme: index.ts (ThemeModule — types.ts), tokens.css, fonts.ts, Header.tsx, Hero.tsx
├── store/                  # Zustand v4: use{Name}Store theo domain (useAppStore, useCartStore, ...)
├── hooks/                  # useDebounce, useClickOutside, useMediaQuery, useWindowSize, usePrevious, useIgnoreFirstEffect...
├── constants/              # paths.ts (PATH.*), orderStatus, validate (message constants + regex), payment, service,
│                           #   address/ (danh mục 2 cấp getProvinces/getWards + MAX_ADDRESSES — xã lazy-import)
├── @types/                 # Product.type, Address.type, index.d.ts
├── utils/                  # cookies, formatPrice, formatTime, toast, localStorage, getParams
├── mocks/                  # mock data (fetchData.ts) — CHỈ còn app/ui-kits/ dùng; không import vào route thật
└── middleware.ts           # route guard: không có phiên (accessToken HOẶC refreshToken) → chặn /user/*;
                            #   có phiên → chặn /login, /register. /cart và /checkout KHÔNG guard (guest cart chủ đích)
```

**Luồng data chuẩn:** component → hàm trong `apis/{domain}.ts` → `config/axios.ts` (tự gắn token, tự refresh khi 401) → BE `api/v1/*`. State chia sẻ → `store/`; state cục bộ → useState; form → react-hook-form.

## Conventions

- **Code style = `.prettierrc` + `.oxlintrc.json` của repo** — hooks tự format/enforce sau mỗi edit, không tự chế style khác.
- Rules tự load theo path: `typescript-pro`, `tailwind-v3`, `zustand-v4`, `react-performance` (xem `.claude/rules/`); `checkout-policy` khi chạm cart / checkout / payment-success, `apis/cart|order.ts`, `useCartStore` (số tiền hiển thị lấy từ response BE).
- Component riêng của 1 route → `app/**/{route}/_component/`. Tái sử dụng ≥2 nơi → `components/ui/`.
- Route path: LUÔN dùng `PATH.*` từ `constants/paths.ts` — không hardcode string.
- Gọi API: LUÔN qua `apis/` — không import axios trực tiếp trong component.
- Lỗi API: interceptor (`config/axios.ts`) tự toast global qua `notifyError`. Endpoint hiển thị lỗi **inline trong form** (hoặc component tự toast message riêng) → PHẢI set `{ toastError: false }` trong `apis/` (quên là bị double display); `{ toastError: "..." }` để override message tĩnh. Component không cần catch-toast nữa — chỉ catch khi cần logic riêng (setMessage, fallback state).
- Component nhiều variant → `cva` theo pattern `components/ui/Button.tsx`.
- Component async: luôn render đủ 3 trạng thái **loading** (`<Spin>`/skeleton hợp layout) / **error** / **empty** — không để vùng trắng khi thiếu data.
- Commit: pre-commit đã có husky + lint-staged (prettier --write + oxlint + tsc strict; oxlint warning chưa chặn commit — để fix sau).
- **`src/middleware.ts` là vùng nhạy cảm** (route guard toàn app) — HỎI user trước khi sửa (làm từ workspace root thì `permissions.ask` đã enforce sẵn).

## Common Commands

```bash
npm run dev          # dev server → http://localhost:3030
npm run build        # build (sitemap/robots là route, không có postbuild)
npm run lint         # oxlint . — warning chưa fail, để fix sau (lint:write để auto-fix)
npx prettier --write src e2e   # format — Stop hook chạy đúng lệnh này trước tsc
npx tsc --noEmit     # type check nhanh
npm test             # vitest: logic thuần, co-located (src/utils/, src/constants/, app/**/_component/), ~0.2s
npm run test:e2e     # Playwright e2e (xem mục Testing)
npm run storybook    # Storybook dev → http://localhost:6006
```

## Testing

**Vitest** (`npm test`) — chỉ logic thuần input→output, env node, KHÔNG test component
(Testing Trophy, chốt phase2). Config `vitest.config.ts` riêng, không đụng Storybook.

**Playwright e2e** — flow mua hàng thật trên FE + BE + MongoDB docker: guest checkout,
user checkout, cart operations, login, register + verify email. Cấu trúc:
`playwright.config.ts` + `e2e/` (spec + `helpers/` + `setup/global-setup.ts`).

```bash
npm run test:e2e:ui   # UI Mode — cách chạy MẶC ĐỊNH cho người: xem browser chạy từng bước,
                      #   tua lại timeline, soi DOM/network mỗi action — không cần học API Playwright
npm run test:e2e      # headless — dành cho /qa và trước commit
```

- **Điều kiện duy nhất:** docker Mongo replica set đang chạy (`docker start ecom-mongo-rs`) —
  thiếu thì globalSetup fail sớm kèm hướng dẫn. Seed tự chạy mỗi run (idempotent).
  Máy mới lần đầu: `npx playwright install chromium` (tải browser binary).
- FE/BE đang chạy sẵn thì dùng luôn (`reuseExistingServer`), chưa chạy thì tự start.
  BE do Playwright tự start được cấp `AUTH_THROTTLE_LIMIT=100` + `ORDER_LOOKUP_THROTTLE_LIMIT=200`
  (nới throttle login/tra cứu đơn khi test dồn dập) và `PAYOS_*` giả + `PAYOS_BASE_URL` cổng chết
  (không bao giờ gọi payOS thật). BE chạy tay muốn chạy cả suite thì export 2 biến throttle trước
  `npm run start:dev`, không là dính 429 "Tra cứu quá nhanh" giữa chừng.
- Spec mở màn chờ chuyển khoản (`/payment-success?orderNumber=`, chi tiết đơn chuyển khoản) PHẢI
  mock route link bằng `mockPaymentLink` (`e2e/helpers/payment-link.ts`) — BE chạy tay với key thật
  mà không mock là tạo link payOS thật cho đơn seed.
- Verify email không có mailbox: test tự ký JWT verification y hệt BE
  (`e2e/helpers/verification-token.ts`, secret đọc runtime từ `.env` backend).
- Data: bám fixture seed cố định (hoodie `07…0003`); order/account test TÍCH LŨY trong DB dev
  (chính sách đã chốt) — thấy bẩn thì chạy lại `npm run seed` phía backend.
- E2e KHÔNG nằm trong Stop hook — chạy qua /qa và trước commit.
- Phân công hybrid: runner chỉ ôm các flow chính ổn định (regression); UI mới/chưa ổn định
  verify bằng browse agentic (playwright MCP) trong tầng audit /qa.


## Gotchas

- **Interceptor axios đã unwrap 1 lớp (`return response.data`)** — trong code, `response` CHÍNH LÀ body BE; `response.data` = field `data` của TransformInterceptor. Endpoint trả mảng trần (banners): `response.data`; trả IResponseList (products/categories): `response.data.data`. Viết thừa `.data` là data rỗng ÂM THẦM (catch nuốt) — đối chiếu curl body trước khi viết accessor.
- **Route static không khai `revalidate` = Full Route Cache VĨNH VIỄN ở production build** — data fetch server-side đóng băng tại thời điểm build; dev/e2e KHÔNG BAO GIỜ thấy lớp bug này (dev render mỗi request). Segment fetch data dùng chung nhiều route → khai `revalidate` ở layout làm mức nền.
- **Tailwind content chỉ scan `src/app`, `src/components`, `src/layouts`** — class viết trong `hooks/`, `utils/`, `constants/` sẽ KHÔNG được generate (im lặng mất style).
- **`middleware.ts` matcher chỉ cover `/login`, `/register`, `/user/*`** — `/cart` và `/checkout` KHÔNG qua middleware (guest cart/checkout là chủ đích, e2e guest checkout đã ghim hành vi này).
- `services/` chỉ còn `todo.ts` gọi jsonplaceholder — boilerplate sót lại, KHÔNG theo pattern này; API layer thật là `apis/`.
- Palette Tailwind bị override toàn bộ trong `tailwind.config.ts` — màu mặc định Tailwind ngoài danh sách không tồn tại. `primary/dark/white/terracotta/page/ink/deep` lấy giá trị từ `src/themes/<theme>/tokens.css` (classic = Pine `#0E7C66`); status scale (red/green/yellow...) + gray cố định, KHÔNG theo theme. Numbering đã chuẩn hóa: mọi nhóm số càng to càng đậm, nấc DEFAULT ghi comment cạnh từng nhóm (chi tiết + typography scale → rule `tailwind-v3`).
- **Đổi symbol trong `public/sprites.svg` phải bump `?v=` trong `SvgIcon.tsx`** — sprite load qua URL có query version, không bump là browser giữ bản icon CŨ im lặng (đã cắn khi đổi icon-filter).
- **Đổi `tailwind.config.ts` phải RESTART dev server** — Next dev KHÔNG hot-reload file này; thêm token mới (màu/shadow...) lúc server đang chạy sẽ không được generate (class ra `none`/rỗng, im lặng). Sửa xong `tailwind.config.ts` → kill + `npm run dev` lại.
- **Theme = alias build-time `@active-theme` → `src/themes/${THEME}`** (`turbopack.resolveAlias` trong `next.config.mjs`; Storybook mirror trong `storybook/main.ts`; `Dockerfile` có `ARG THEME=rosier`). THEME không có thư mục → config throw `Unknown THEME "x". Valid: classic, rosier` (dev/build fail ngay). `tsconfig.json` paths `@active-theme` → classic CHỈ để type-check (mọi theme cùng `ThemeModule`) — không quyết định runtime; `next dev --webpack` bỏ qua `turbopack.resolveAlias` nên rơi về tsconfig paths (= classic).
- **Đổi `THEME` (shell hoặc `.env.local`) phải RESTART dev server** — `next.config.mjs` chỉ đọc env lúc load. Shell env thắng `.env.local`. Chạy Storybook theme khác: `THEME=classic npm run storybook`.
- **Font của theme bắt buộc có subset `vietnamese`** — thiếu là dấu tiếng Việt render font fallback. Check trước khi chọn font: `node_modules/next/dist/compiled/@next/font/dist/google/font-data.json` (Instrument Serif/Sans, Bodoni Moda KHÔNG có). Chỉ load weight đang dùng (rosier Playfair chỉ 400) → không gắn `font-bold` lên tiêu đề display (trình duyệt tự đậm giả); đổi cỡ/đậm tiêu đề qua role `.type-display-section/-page/-sub` (biến `--display-*` trong tokens.css).
- **`tokens.css` chỉ khai biến trên `:root`** (không `@layer`/`@apply`/selector khác). Màu = kênh RGB `R G B` (không `#hex`/`rgb()`) để Tailwind opacity modifier `rgb(var(--color-x) / <alpha-value>)` chạy. SCSS dùng thẳng `rgb(var(--color-…))` — KHÔNG tạo alias trùng tên kiểu `--color-primary-700: rgb(var(--color-primary-700))` (vòng lặp trên `:root`, màu mất im lặng).
- **Thêm theme mới:** copy `src/themes/classic/` → `src/themes/<tên>/` (tên thư mục = giá trị THEME). `tokens.css` giữ ĐỦ danh sách biến như classic (thiếu biến = class rỗng im lặng); `fonts.ts` dùng next/font với `variable: "--font-body"` (+ `"--font-display"` nếu có font tiêu đề riêng, không thì `--font-display: var(--font-body)` trong tokens.css); `Header.tsx`/`Hero.tsx` giữ props `ThemeHeaderProps`/`ThemeHeroProps` hoặc re-export bản classic; kiểm `THEME=<tên> npm run build` + `THEME=<tên> npm run test:e2e`. E2e viết theo markup header rosier (theme mặc định) — header khác markup thì sửa selector, giữ intent.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
