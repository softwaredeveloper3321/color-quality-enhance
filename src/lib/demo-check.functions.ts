import { createServerFn } from "@tanstack/react-start";

export interface DemoCheckResult {
  ok: boolean;
  httpStatus: number | null;
  responseTimeMs: number;
  ssl: boolean;
  loginPageAccessible: boolean;
  verdict: "working" | "slow" | "offline";
  message: string;
  checkedAt: string;
}

const TIMEOUT_MS = 12_000;
const SLOW_MS = 2_500;

async function timedFetch(url: string, method: "GET" | "HEAD") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "SoftwareVala-DemoChecker/1.0" },
    });
  } finally {
    clearTimeout(timer);
  }
}

export const checkDemoUrl = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string }) => {
    const url = String(data?.url ?? "").trim();
    if (!/^https?:\/\/[^\s]+$/i.test(url)) throw new Error("Enter a valid http(s) URL");
    return { url };
  })
  .handler(async ({ data }): Promise<DemoCheckResult> => {
    const started = Date.now();
    const checkedAt = new Date().toISOString();
    const ssl = data.url.toLowerCase().startsWith("https://");

    try {
      const res = await timedFetch(data.url, "GET");
      const responseTimeMs = Date.now() - started;
      const httpStatus = res.status;
      const ok = res.status >= 200 && res.status < 400;

      let loginPageAccessible = false;
      if (ok) {
        try {
          const body = (await res.text()).slice(0, 250_000).toLowerCase();
          loginPageAccessible =
            /type=["']password["']/.test(body) ||
            /(sign in|sign-in|log ?in|username|email)/.test(body);
        } catch {
          loginPageAccessible = false;
        }
      }

      const verdict: DemoCheckResult["verdict"] = !ok
        ? "offline"
        : responseTimeMs > SLOW_MS
          ? "slow"
          : "working";

      return {
        ok,
        httpStatus,
        responseTimeMs,
        ssl,
        loginPageAccessible,
        verdict,
        message: ok ? `HTTP ${httpStatus} in ${responseTimeMs}ms` : `HTTP ${httpStatus}`,
        checkedAt,
      };
    } catch (error) {
      const responseTimeMs = Date.now() - started;
      const aborted = error instanceof Error && error.name === "AbortError";
      return {
        ok: false,
        httpStatus: null,
        responseTimeMs,
        ssl,
        loginPageAccessible: false,
        verdict: "offline",
        message: aborted ? "Timed out after 12s" : "Unreachable / DNS or network error",
        checkedAt,
      };
    }
  });
