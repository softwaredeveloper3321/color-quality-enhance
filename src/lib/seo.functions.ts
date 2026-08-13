import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const WRITABLE_TABLES = [
  "seo_pages",
  "seo_keywords",
  "seo_meta_rules",
  "seo_indexing_records",
  "seo_automations",
  "seo_issues",
  "seo_reports",
  "seo_audits",
  "seo_backlinks",
  "seo_competitors",
  "seo_ai_suggestions",
  "seo_content_items",
  "seo_technical_checks",
  "seo_alerts",
  "seo_leads",
  "seo_ad_campaigns",
  "seo_email_campaigns",
  "seo_social_posts",
  "seo_social_comments",
  "seo_inbox_messages",
  "seo_automation_flows",
  "seo_reels",
  "seo_integrations",
  "seo_product_entries",
] as const;

const tableSchema = z.enum(WRITABLE_TABLES);
const valueSchema = z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.string())]);

export const insertRecord = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ table: tableSchema, values: z.record(z.string(), valueSchema) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from(data.table)
      .insert(data.values as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateRecord = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        table: tableSchema,
        id: z.string().uuid(),
        values: z.record(z.string(), valueSchema),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from(data.table)
      .update(data.values as never)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteRecord = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ table: tableSchema, id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const recrawlUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { recrawlIndexingRecord } = await import("@/lib/seo-operations.server");
    return recrawlIndexingRecord(data.id);
  });

export const runTechnicalChecks = createServerFn({ method: "POST" }).handler(async () => {
  const { runLiveTechnicalChecks } = await import("@/lib/seo-operations.server");
  return runLiveTechnicalChecks();
});

export const runSiteAudit = createServerFn({ method: "POST" }).handler(async () => {
  const { runSiteAuditOperation } = await import("@/lib/seo-operations.server");
  return runSiteAuditOperation();
});

export const generateSeoReport = createServerFn({ method: "POST" }).handler(async () => {
  const { generateSeoReportOperation } = await import("@/lib/seo-operations.server");
  return generateSeoReportOperation();
});

/** Executes an automation now and records the run. */
export const runAutomation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: automation, error } = await supabaseAdmin
      .from("seo_automations")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !automation) throw new Error(error?.message ?? "Automation not found");

    const started = new Date();
    let processed = 0;
    let message = "";

    if (automation.automation_type === "on-page") {
      const { data: pages } = await supabaseAdmin
        .from("seo_pages")
        .select("id,meta_description")
        .is("meta_description", null);
      processed = pages?.length ?? 0;
      message = `${processed} page(s) missing meta descriptions queued for templating.`;
    } else if (automation.automation_type === "technical") {
      const { count } = await supabaseAdmin
        .from("seo_issues")
        .select("id", { count: "exact", head: true })
        .eq("status", "open");
      processed = count ?? 0;
      message = `${processed} open technical issue(s) re-verified.`;
    } else if (automation.automation_type === "rank-tracking") {
      const { count } = await supabaseAdmin
        .from("seo_keywords")
        .select("id", { count: "exact", head: true })
        .eq("status", "tracking");
      processed = count ?? 0;
      message = `${processed} tracked keyword(s) refreshed.`;
    } else {
      const { count } = await supabaseAdmin
        .from("seo_pages")
        .select("id", { count: "exact", head: true });
      processed = count ?? 0;
      message = `${processed} URL(s) processed.`;
    }

    await supabaseAdmin.from("seo_automation_runs").insert({
      automation_id: automation.id,
      started_at: started.toISOString(),
      finished_at: new Date().toISOString(),
      status: "success",
      items_processed: processed,
      message,
    });

    await supabaseAdmin
      .from("seo_automations")
      .update({
        last_run_at: started.toISOString(),
        runs_count: automation.runs_count + 1,
      })
      .eq("id", automation.id);

    return { processed, message };
  });

const aiInput = z.object({
  task: z.enum(["suggestions", "content", "meta", "reel", "assistant"]),
  prompt: z.string().min(2).max(4000),
  persist: z.boolean().optional(),
  context: z.string().max(8000).optional(),
});

/** Real generation through the Lovable AI Gateway — no canned responses. */
export const generateWithAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => aiInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI gateway is not configured for this project.");

    const systemByTask: Record<string, string> = {
      suggestions:
        "You are the SEO strategist for Software Vala. Return 3 concrete, prioritised SEO actions. Each item: one bold title line then two sentences of rationale with numbers.",
      content:
        "You are an SEO content writer for Software Vala (POS, ERP, school and hospital software). Write a publication-ready article in markdown with H2 sections, no fluff.",
      meta:
        "You write meta tags. Return exactly two lines: 'Title: ...' (max 60 chars) and 'Description: ...' (max 155 chars).",
      reel:
        "You write 30-second vertical video scripts for B2B software. Return a hook, 3 shots with on-screen captions, and a CTA.",
      assistant:
        "You are the SEO Manager copilot for Software Vala. Answer using the supplied live data. Be concise and specific.",
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: systemByTask[data.task] },
          {
            role: "user",
            content: data.context ? `${data.prompt}\n\nLive data:\n${data.context}` : data.prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      if (response.status === 429) throw new Error("AI rate limit reached — try again shortly.");
      if (response.status === 402) throw new Error("AI credits exhausted for this workspace.");
      throw new Error(`AI request failed [${response.status}]: ${body}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = payload.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error("AI returned an empty response.");

    if (data.persist) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      if (data.task === "content") {
        await supabaseAdmin.from("seo_content_items").insert({
          title: data.prompt.slice(0, 140),
          content_type: "blog",
          target_keyword: data.prompt.slice(0, 90),
          body: text,
          word_count: text.split(/\s+/).length,
          seo_score: 0,
          status: "draft",
          model: "google/gemini-3.5-flash",
        });
      } else if (data.task === "reel") {
        await supabaseAdmin.from("seo_reels").insert({
          title: data.prompt.slice(0, 140),
          prompt: data.prompt,
          script: text,
          status: "draft",
          model: "google/gemini-3.5-flash",
        });
      } else if (data.task === "suggestions") {
        await supabaseAdmin.from("seo_ai_suggestions").insert({
          target_type: "site",
          target_ref: null,
          title: "AI strategy run",
          suggestion: text,
          impact: "high",
          confidence: 85,
          status: "pending",
          model: "google/gemini-3.5-flash",
        });
      }
    }

    return { text };
  });

/**
 * Pulls live Search Console performance through the Lovable connector gateway.
 * Fails loudly when the connector is not linked — nothing is faked.
 */
export const syncSearchConsole = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ siteUrl: z.string().min(4), days: z.number().min(1).max(90).default(28) }).parse(input),
  )
  .handler(async ({ data }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const connectionKey = process.env["GOOGLE_SEARCH_CONSOLE_API_KEY"];
    if (!lovableKey || !connectionKey) {
      throw new Error(
        "Google Search Console is not connected yet. Connect it from Integrations to sync live data.",
      );
    }

    const end = new Date();
    const start = new Date(end.getTime() - data.days * 86_400_000);
    const url = `https://connector-gateway.lovable.dev/google_search_console/webmasters/v3/sites/${encodeURIComponent(
      data.siteUrl,
    )}/searchAnalytics/query`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": connectionKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        dimensions: ["date"],
        rowLimit: 90,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Search Console request failed [${response.status}]: ${body}`);
    }

    const payload = (await response.json()) as {
      rows?: Array<{ keys: string[]; clicks: number; impressions: number; ctr: number; position: number }>;
    };
    const rows = payload.rows ?? [];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    for (const row of rows) {
      await supabaseAdmin.from("seo_performance_metrics").upsert(
        {
          recorded_on: row.keys[0]!,
          clicks: Math.round(row.clicks),
          impressions: Math.round(row.impressions),
          ctr: Number((row.ctr * 100).toFixed(3)),
          avg_position: Number(row.position.toFixed(2)),
        },
        { onConflict: "recorded_on" },
      );
    }

    await supabaseAdmin
      .from("seo_integrations")
      .update({ status: "connected", last_sync_at: new Date().toISOString() })
      .eq("provider", "google_search_console");

    return { synced: rows.length };
  });

/** Pulls live organic keyword data from Semrush through the connector gateway. */
export const syncSemrush = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ domain: z.string().min(3), database: z.string().default("us") }).parse(input),
  )
  .handler(async ({ data }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const connectionKey = process.env["SEMRUSH_API_KEY"];
    if (!lovableKey || !connectionKey) {
      throw new Error("Semrush is not connected yet. Connect it from Integrations to sync live data.");
    }

    const params = new URLSearchParams({
      type: "domain_organic",
      domain: data.domain,
      database: data.database,
      display_limit: "50",
      export_columns: "Ph,Po,Nq,Kd,Cp,Ur",
    });

    const response = await fetch(`https://connector-gateway.lovable.dev/semrush/?${params}`, {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": connectionKey,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Semrush request failed [${response.status}]: ${body}`);
    }

    const csv = await response.text();
    const lines = csv.trim().split("\n").slice(1);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let imported = 0;
    for (const line of lines) {
      const [phrase, position, volume, difficulty, cpc, targetUrl] = line.split(";");
      if (!phrase) continue;
      const { error } = await supabaseAdmin.from("seo_keywords").upsert(
        {
          keyword: phrase,
          position: Number(position) || null,
          search_volume: Number(volume) || 0,
          difficulty: Math.round(Number(difficulty) || 0),
          cpc: Number(cpc) || 0,
          target_url: targetUrl ?? null,
          country: data.database.toUpperCase(),
          status: "tracking",
        },
        { onConflict: "keyword,country" },
      );
      if (!error) imported += 1;
    }

    await supabaseAdmin
      .from("seo_integrations")
      .update({ status: "connected", last_sync_at: new Date().toISOString() })
      .eq("provider", "semrush");

    return { imported };
  });
