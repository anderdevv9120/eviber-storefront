import { readdirSync, readFileSync } from "fs";
import path from "path";

export type CapturedMail = {
  capturedAt: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

const mailboxDir = () => {
  const dir = process.env.REFUND_E2E_MAILBOX_DIR;
  if (!dir)
    throw new Error(
      "REFUND_E2E_MAILBOX_DIR is not set — run through playwright.refunds.config.ts"
    );
  return dir;
};

export function capturedMails(to?: string): CapturedMail[] {
  return readdirSync(mailboxDir())
    .filter((name) => name.startsWith("mail-"))
    .map(
      (name) =>
        JSON.parse(
          readFileSync(path.join(mailboxDir(), name), "utf8")
        ) as CapturedMail
    )
    .filter((mail) => !to || mail.to === to)
    .sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
}

// The token lives in the URL fragment of the guest verification mail; callers never log the URL.
const ACCESS_URL = /https?:\/\/[^\s"'<>]+#token=[A-Za-z0-9_-]+/;

export async function waitForRefundAccessUrl(
  to: string,
  sinceCount = 0,
  timeoutMs = 15_000
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const mails = capturedMails(to).filter(
      (mail) => ACCESS_URL.test(mail.text) || ACCESS_URL.test(mail.html)
    );
    if (mails.length > sinceCount) {
      const mail = mails[mails.length - 1];
      return (ACCESS_URL.exec(mail.text) ?? ACCESS_URL.exec(mail.html))![0];
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`No refund access mail captured for ${to}`);
}

export const refundAccessMailCount = (to: string) =>
  capturedMails(to).filter(
    (mail) => ACCESS_URL.test(mail.text) || ACCESS_URL.test(mail.html)
  ).length;
