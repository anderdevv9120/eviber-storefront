import { config } from "dotenv";
import path from "path";

const parsed =
  config({
    path: path.resolve(__dirname, "../../../backend/.env"),
    processEnv: {},
    quiet: true,
  }).parsed ?? {};

export function backendEnv(key: string): string | undefined {
  return parsed[key];
}
