import { execSync } from "child_process";
import { createConnection } from "net";
import path from "path";

const BACKEND_DIR = path.resolve(__dirname, "../../../x-ecommerce-backend");

function assertMongoRunning(): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = createConnection({
      host: "127.0.0.1",
      port: 27017,
      timeout: 2_000,
    });
    const fail = () => {
      socket.destroy();
      reject(
        new Error(
          "MongoDB chưa chạy trên :27017 — chạy `docker start ecom-mongo-rs` rồi thử lại."
        )
      );
    };
    socket.once("connect", () => {
      socket.destroy();
      resolve();
    });
    socket.once("error", fail);
    socket.once("timeout", fail);
  });
}

export default async function globalSetup(): Promise<void> {
  await assertMongoRunning();
  // Gọi thẳng nest CLI thay vì `npm run seed`: npm trên máy dev này exit 1
  // dù seed thành công (quirk đã ghi trong tasks/phase2/done/be-test-foundation.md)
  execSync("./node_modules/.bin/nest start --entryFile seeds/seed", {
    cwd: BACKEND_DIR,
    stdio: "inherit",
  });
}
