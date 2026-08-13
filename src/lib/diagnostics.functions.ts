import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Runs the live data-layer benchmark suite and stores the results. */
export const runBenchmarks = createServerFn({ method: "POST" }).handler(async () => {
  const { runBenchmarkSuite } = await import("@/lib/diagnostics.server");
  const results = await runBenchmarkSuite(true);
  return { results };
});

/** Records a client-side/route failure with actionable context. */
export const reportError = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        message: z.string().min(1).max(2000),
        name: z.string().max(200).optional(),
        stack: z.string().max(6000).optional(),
        route: z.string().max(500).optional(),
        severity: z.enum(["warning", "error", "critical"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { captureServerError } = await import("@/lib/seo-monitoring.server");
    const error = new Error(data.message);
    error.name = data.name ?? "ClientError";
    if (data.stack) error.stack = data.stack;
    await captureServerError({
      source: "client",
      error,
      route: data.route ?? null,
      severity: data.severity ?? "error",
      context: { reportedBy: "browser" },
    });
    return { ok: true };
  });

/** Marks a captured error as resolved from the diagnostics view. */
export const resolveErrorEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("seo_error_events")
      .update({ resolved: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
