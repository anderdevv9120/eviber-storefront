import { ChildProcess, execFileSync, spawn } from "child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from "fs";
import { createRequire } from "module";
import { createConnection } from "net";
import os from "os";
import path from "path";

// Isolated refund harness: owns a temporary MongoMemoryReplSet, a seed run and fresh
// backend/admin/storefront processes. It never reuses servers and never touches :27017.
const BACKEND_DIR = path.resolve(__dirname, "../../../backend");
const CMS_DIR = path.resolve(__dirname, "../../../cms-frontend");
const FRONTEND_DIR = path.resolve(__dirname, "../..");
const CAPTURE_PRELOAD = path.join(
  BACKEND_DIR,
  "test/helpers/refund-email-capture.cjs"
);

// cms (3131) serves CMS visual acceptance against the isolated admin API; not reused either.
const PORTS = { backend: 3109, admin: 8111, web: 3130, cms: 3131 } as const;
const WEB_URL = `http://localhost:${PORTS.web}`;
const CMS_URL = `http://localhost:${PORTS.cms}`;
const API_URL = `http://localhost:${PORTS.backend}/api/v1`;
const ADMIN_API_URL = `http://localhost:${PORTS.admin}/admin/v1`;

const FAKE_PROVIDER_ENV = {
  PAYOS_CLIENT_ID: "e2e-client-id",
  PAYOS_API_KEY: "e2e-api-key",
  PAYOS_CHECKSUM_KEY: "e2e-checksum-key",
  PAYOS_BASE_URL: "http://127.0.0.1:9",
  IMAGEKIT_PRIVATE_KEY: "e2e-imagekit-key",
  SYSTEM_EMAIL: "refund-e2e@refund-e2e.invalid",
  SYSTEM_EMAIL_PASSWORD: "e2e-not-a-password",
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function portInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({
      host: "127.0.0.1",
      port,
      timeout: 1_000,
    });
    socket.once("connect", () => (socket.destroy(), resolve(true)));
    socket.once("error", () => (socket.destroy(), resolve(false)));
    socket.once("timeout", () => (socket.destroy(), resolve(false)));
  });
}

async function waitForUrl(
  url: string,
  child: ChildProcess,
  label: string,
  timeoutMs = 240_000
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error(`${label} exited early with code ${child.exitCode}`);
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // not listening yet
    }
    await sleep(500);
  }
  throw new Error(`${label} did not answer ${url} within ${timeoutMs / 1000}s`);
}

function killTree(child: ChildProcess) {
  if (child.pid === undefined || child.exitCode !== null) return;
  try {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      child.kill("SIGKILL");
    }
  } catch {
    // already gone
  }
}

// Async on purpose: a blocking spawn starves the in-memory replica set and the seed hangs.
async function runToExit(
  label: string,
  args: string[],
  env: NodeJS.ProcessEnv,
  timeoutMs: number
) {
  const child = spawn(process.execPath, args, {
    cwd: BACKEND_DIR,
    env,
    stdio: "inherit",
    windowsHide: true,
  });
  const timer = setTimeout(() => killTree(child), timeoutMs);
  const code = await new Promise<number | null>((resolve) =>
    child.once("exit", resolve)
  );
  clearTimeout(timer);
  if (code !== 0) throw new Error(`${label} failed (exit ${code})`);
}

function assertIsolation(
  mongoUri: string,
  childEnvs: Record<string, NodeJS.ProcessEnv>,
  mailboxDir: string
) {
  const uri = new URL(mongoUri);
  if (uri.hostname !== "127.0.0.1" || uri.port === "27017") {
    throw new Error(
      `Refund harness MongoDB must be a temporary replica set, got ${uri.host}`
    );
  }
  for (const [name, env] of Object.entries(childEnvs)) {
    if (env.MONGO_URI !== mongoUri)
      throw new Error(`${name} does not use the harness MongoDB URI`);
    if (env.MONGO_DATABASES !== "")
      throw new Error(`${name} must clear MONGO_DATABASES tenant overrides`);
    if (env.REFUND_E2E_MAILBOX_DIR !== mailboxDir)
      throw new Error(`${name} does not share the harness mailbox`);
  }
  for (const name of ["backend", "admin", "seed"]) {
    const env = childEnvs[name];
    if (
      env.PAYOS_BASE_URL !== FAKE_PROVIDER_ENV.PAYOS_BASE_URL ||
      env.PAYOS_API_KEY !== FAKE_PROVIDER_ENV.PAYOS_API_KEY
    ) {
      throw new Error(`${name} must use fake payOS configuration`);
    }
    if (!env.SYSTEM_EMAIL?.endsWith("@refund-e2e.invalid"))
      throw new Error(`${name} must use a fake system mailbox`);
  }
  for (const name of ["backend", "admin"]) {
    if (!childEnvs[name].NODE_OPTIONS?.includes("refund-email-capture.cjs")) {
      throw new Error(`${name} must preload the mailbox capture`);
    }
  }
  if (
    childEnvs.web.NEXT_PUBLIC_API_URL !== API_URL ||
    childEnvs.web.NEXT_PUBLIC_SHOWCASE_API_URL !== API_URL
  ) {
    throw new Error(
      "Storefront must point at the isolated backend, not a live API"
    );
  }
  if (childEnvs.cms.VITE_ADMIN_API_URL !== ADMIN_API_URL)
    throw new Error("CMS must point at the isolated admin API");
  if (childEnvs.web.NEXT_PUBLIC_SITE_URL !== WEB_URL)
    throw new Error("Storefront site URL must be the isolated web server");
}

export default async function globalSetup(): Promise<() => Promise<void>> {
  const children: ChildProcess[] = [];
  let tempDir: string | undefined;
  let replSet:
    { stop(): Promise<unknown>; getUri(db?: string): string } | undefined;

  const teardown = async () => {
    children.forEach(killTree);
    await replSet?.stop().catch(() => undefined);
    if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  };

  try {
    for (const port of Object.values(PORTS)) {
      if (await portInUse(port))
        throw new Error(
          `Port ${port} is occupied; the refund harness never reuses servers`
        );
    }

    const backendRequire = createRequire(
      path.join(BACKEND_DIR, "package.json")
    );
    const { MongoMemoryReplSet } = backendRequire("mongodb-memory-server");
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const mongoUri: string = replSet!.getUri("refund_e2e");

    tempDir = mkdtempSync(path.join(os.tmpdir(), "eviber-refund-e2e-"));
    const mailboxDir = path.join(tempDir, "mailbox");
    mkdirSync(mailboxDir);

    const base: NodeJS.ProcessEnv = {
      ...process.env,
      ...FAKE_PROVIDER_ENV,
      MONGO_URI: mongoUri,
      MONGO_DATABASES: "",
      WEB_URL,
      ADMIN_WEB_URL: CMS_URL,
      CORS_ORIGINS: WEB_URL,
      REFUND_E2E_MAILBOX_DIR: mailboxDir,
      AUTH_THROTTLE_LIMIT: "200",
      ORDER_LOOKUP_THROTTLE_LIMIT: "400",
      ORDER_PAYMENT_DUE_HOURS: "1",
      TS_NODE_BASEURL: path.join(BACKEND_DIR, "lib"),
    };
    const preload = `--require "${CAPTURE_PRELOAD.replace(/\\/g, "/")}"`;
    const envs = {
      seed: { ...base },
      backend: {
        ...base,
        PORT: String(PORTS.backend),
        STOREFRONT_PORT: String(PORTS.backend),
        NODE_OPTIONS: preload,
      },
      admin: {
        ...base,
        ADMIN_PORT: String(PORTS.admin),
        NODE_OPTIONS: preload,
      },
      web: {
        ...base,
        NEXT_PUBLIC_API_URL: API_URL,
        NEXT_PUBLIC_SHOWCASE_API_URL: API_URL,
        NEXT_PUBLIC_SITE_URL: WEB_URL,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      cms: { ...base, VITE_ADMIN_API_URL: ADMIN_API_URL, BROWSER: "none" },
    };
    assertIsolation(mongoUri, envs, mailboxDir);

    // Build + seed only after the isolation assertions pass. Explicit build: `nest start` can run a
    // stale lib/ (and has hung here); lib/src/* is what `nest build` emits for this repo.
    const nest = path.join(BACKEND_DIR, "node_modules/@nestjs/cli/bin/nest.js");
    await runToExit("build", [nest, "build"], envs.seed, 300_000);
    await runToExit(
      "seed",
      ["-r", "tsconfig-paths/register", "lib/src/seeds/seed.js"],
      envs.seed,
      120_000
    );

    const start = (
      name: string,
      cwd: string,
      args: string[],
      env: NodeJS.ProcessEnv
    ) => {
      const child = spawn(process.execPath, args, {
        cwd,
        env,
        stdio: "inherit",
        windowsHide: true,
      });
      children.push(child);
      return child;
    };
    const backend = start(
      "backend",
      BACKEND_DIR,
      ["-r", "tsconfig-paths/register", "lib/src/main.js"],
      envs.backend
    );
    const admin = start(
      "admin",
      BACKEND_DIR,
      ["-r", "tsconfig-paths/register", "lib/src/main-admin.js"],
      envs.admin
    );
    const web = start(
      "web",
      FRONTEND_DIR,
      [
        path.join(FRONTEND_DIR, "node_modules/next/dist/bin/next"),
        "dev",
        "-p",
        String(PORTS.web),
      ],
      envs.web
    );
    const cms = start(
      "cms",
      CMS_DIR,
      [
        path.join(CMS_DIR, "node_modules/vite/bin/vite.js"),
        "--port",
        String(PORTS.cms),
        "--strictPort",
      ],
      envs.cms
    );
    await Promise.all([
      waitForUrl(CMS_URL, cms, "cms"),
      waitForUrl(`${API_URL}/products`, backend, "backend"),
      waitForUrl(`http://localhost:${PORTS.admin}/admin-docs`, admin, "admin"),
      waitForUrl(WEB_URL, web, "storefront"),
    ]);

    // Mailbox capture must be live in both backend processes before any scenario runs.
    const active = readdirSync(mailboxDir).filter((name) =>
      name.startsWith("active-")
    );
    if (active.length < 2)
      throw new Error(
        `Mailbox capture active in ${active.length}/2 backend processes`
      );
    if (!existsSync(mailboxDir)) throw new Error("Mailbox directory vanished");

    process.env.REFUND_E2E_MAILBOX_DIR = mailboxDir;
    process.env.REFUND_E2E_WEB = WEB_URL;
    process.env.REFUND_E2E_CMS = CMS_URL;
    // Base URLs for the existing specs this config may also run.
    process.env.E2E_API = API_URL;
    process.env.E2E_ADMIN_API = ADMIN_API_URL;
    process.env.REFUND_E2E_API = API_URL;
    process.env.REFUND_E2E_ADMIN_API = ADMIN_API_URL;
    process.env.REFUND_E2E_MONGO_URI = mongoUri;
    return teardown;
  } catch (error) {
    await teardown();
    throw error;
  }
}
