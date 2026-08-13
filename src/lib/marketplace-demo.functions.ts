// Demo URL Manager — CRUD + live health-check server functions.
// Admin-only. RLS restricts to boss/admin roles.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function audit(
  context: any,
  action: string,
  demoUrlId: string | null,
  metadata: Record<string, unknown> = {},
) {
  try {
    await (context.supabase as any).from("demo_url_audit_log").insert({
      demo_url_id: demoUrlId,
      action,
      actor_id: context.userId ?? null,
      actor_email: context.claims?.email ?? null,
      metadata,
    });
  } catch (e) {
    console.warn("[demo-audit] failed", action, e);
  }
}

export type DemoAuditEntry = {
  id: string;
  demo_url_id: string | null;
  action: string;
  actor_id: string | null;
  actor_email: string | null;
  metadata: any;
  created_at: string;
};


export type DemoUrl = {
  id: string;
  product_id: string | null;
  demo_name: string;
  role_name: string;
  url: string;
  username: string | null;
  password: string | null;
  description: string | null;
  environment: "production" | "staging" | "testing";
  status: "active" | "inactive";
  sort_order: number;
  last_checked_at: string | null;
  last_response_ms: number | null;
  last_http_status: number | null;
  last_result: "working" | "slow" | "offline" | "unknown";
  ssl_valid: boolean | null;
  created_at: string;
  updated_at: string;
};

const demoSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid().nullable().optional(),
  demo_name: z.string().min(1).max(120),
  role_name: z.string().min(1).max(80),
  url: z.string().url().max(1024),
  username: z.string().max(200).nullable().optional(),
  password: z.string().max(400).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  environment: z.enum(["production", "staging", "testing"]).default("production"),
  status: z.enum(["active", "inactive"]).default("active"),
  sort_order: z.number().int().default(0),
});

export const listDemoUrls = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (context.supabase as any)
      .from("product_demo_urls")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as DemoUrl[];
  });

export const upsertDemoUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => demoSchema.parse(v))
  .handler(async ({ data, context }) => {
    const isUpdate = !!(data as any).id;
    const { error, data: row } = await (context.supabase as any)
      .from("product_demo_urls")
      .upsert(data as any)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await audit(context, isUpdate ? "demo_url.update" : "demo_url.create", (row as any).id, {
      demo_name: (row as any).demo_name,
      role_name: (row as any).role_name,
      url: (row as any).url,
      environment: (row as any).environment,
      status: (row as any).status,
    });
    return row as DemoUrl;
  });

export const deleteDemoUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: prev } = await (context.supabase as any)
      .from("product_demo_urls").select("demo_name, url").eq("id", data.id).single();
    const { error } = await (context.supabase as any)
      .from("product_demo_urls").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context, "demo_url.delete", data.id, prev ?? {});
    return { ok: true };
  });

export const duplicateDemoUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: src, error: e1 } = await (context.supabase as any)
      .from("product_demo_urls").select("*").eq("id", data.id).single();
    if (e1 || !src) throw new Error(e1?.message ?? "Not found");
    const { id: _i, created_at: _c, updated_at: _u, ...copy } = src as any;
    copy.demo_name = `${copy.demo_name} (copy)`;
    const { data: row, error } = await (context.supabase as any)
      .from("product_demo_urls").insert(copy).select().single();
    if (error) throw new Error(error.message);
    await audit(context, "demo_url.duplicate", (row as any).id, {
      source_id: data.id,
      demo_name: (row as any).demo_name,
    });
    return row as DemoUrl;
  });

export const toggleDemoUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid(), status: z.enum(["active", "inactive"]) }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any)
      .from("product_demo_urls").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context, data.status === "active" ? "demo_url.enable" : "demo_url.disable", data.id, {
      status: data.status,
    });
    return { ok: true };
  });


async function checkOnce(url: string) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    let res: Response;
    try {
      res = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
      if (res.status >= 400) {
        res = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
      }
    } finally {
      clearTimeout(timer);
    }
    const ms = Date.now() - start;
    const ok = res.status >= 200 && res.status < 400;
    const result: DemoUrl["last_result"] = !ok ? "offline" : ms > 2500 ? "slow" : "working";
    return {
      ok,
      status: res.status,
      ms,
      result,
      ssl: url.startsWith("https://") ? ok : null,
    };
  } catch {
    return { ok: false, status: 0, ms: Date.now() - start, result: "offline" as const, ssl: null };
  }
}

export const testDemoUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    // NOTE: overrides earlier declaration was replaced above; keep single testDemoUrl block
    const { data: row, error } = await (context.supabase as any)
      .from("product_demo_urls").select("id, url").eq("id", data.id).single();
    if (error || !row) throw new Error(error?.message ?? "Not found");
    const r = await checkOnce(row.url);
    const patch = {
      last_checked_at: new Date().toISOString(),
      last_response_ms: r.ms,
      last_http_status: r.status,
      last_result: r.result,
      ssl_valid: r.ssl,
    };
    await (context.supabase as any).from("product_demo_urls").update(patch).eq("id", data.id);
    await audit(context, "demo_url.test", data.id, {
      http_status: r.status,
      response_ms: r.ms,
      result: r.result,
      ssl_valid: r.ssl,
    });
    return { id: data.id, ...patch };
  });

export const testAllDemoUrls = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: rows, error } = await (context.supabase as any)
      .from("product_demo_urls").select("id, url").eq("status", "active");
    if (error) throw new Error(error.message);
    const results = await Promise.all(
      ((rows ?? []) as { id: string; url: string }[]).map(async (r) => {
        const c = await checkOnce(r.url);
        const patch = {
          last_checked_at: new Date().toISOString(),
          last_response_ms: c.ms,
          last_http_status: c.status,
          last_result: c.result,
          ssl_valid: c.ssl,
        };
        await (context.supabase as any).from("product_demo_urls").update(patch).eq("id", r.id);
        await audit(context, "demo_url.test", r.id, {
          http_status: c.status,
          response_ms: c.ms,
          result: c.result,
          ssl_valid: c.ssl,
          batch: true,
        });
        return { id: r.id, ...patch };
      })
    );
    await audit(context, "demo_url.test_all", null, { count: results.length });
    return results;
  });

export const listDemoAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      demo_url_id: z.string().uuid().optional(),
      limit: z.number().int().min(1).max(500).default(100),
    }).parse(v ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = (context.supabase as any)
      .from("demo_url_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.demo_url_id) q = q.eq("demo_url_id", data.demo_url_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as DemoAuditEntry[];
  });

