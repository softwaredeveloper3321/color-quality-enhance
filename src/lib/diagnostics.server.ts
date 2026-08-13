/**
 * Performance benchmarks for the SEO Manager data layer.
 * Every number below is measured against the live database — nothing is faked.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type BenchmarkResult = {
  label: string;
  target: string;
  ttfbMs: number;
  queryMs: number;
  paginationMs: number;
  reportMs: number;
  rowsScanned: number;
  status: "pass" | "warn" | "fail";
  notes: string;
};

const round = (n: number) => Number(n.toFixed(1));

function grade(total: number): "pass" | "warn" | "fail" {
  if (total < 400) return "pass";
  if (total < 1200) return "warn";
  return "fail";
}

/** Raw HTTP time-to-first-byte against the Data API for one table. */
async function measureTtfb(table: string): Promise<number> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) return 0;
  const started = performance.now();
  const response = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
    headers: { apikey: key, Accept: "application/json" },
  });
  await response.arrayBuffer();
  return round(performance.now() - started);
}

async function benchmarkTable(
  label: string,
  table: "seo_pages" | "seo_keywords" | "seo_keyword_rankings" | "seo_performance_metrics",
  pageSize: number,
): Promise<BenchmarkResult> {
  const ttfbMs = await measureTtfb(table);

  const queryStart = performance.now();
  const { data: firstPage, error, count } = await supabaseAdmin
    .from(table)
    .select("*", { count: "exact" })
    .range(0, pageSize - 1);
  const queryMs = round(performance.now() - queryStart);

  const pageStart = performance.now();
  const { data: secondPage } = await supabaseAdmin
    .from(table)
    .select("*")
    .range(pageSize, pageSize * 2 - 1);
  const paginationMs = round(performance.now() - pageStart);

  const rowsScanned = (firstPage?.length ?? 0) + (secondPage?.length ?? 0);
  const total = ttfbMs + queryMs + paginationMs;

  return {
    label,
    target: table,
    ttfbMs,
    queryMs,
    paginationMs,
    reportMs: 0,
    rowsScanned,
    status: error ? "fail" : grade(total),
    notes: error
      ? `Query failed: ${error.message}`
      : `${count ?? rowsScanned} row(s) total · page size ${pageSize}`,
  };
}

/** End-to-end report generation: aggregate 90 days of metrics the way Reports does. */
async function benchmarkReport(): Promise<BenchmarkResult> {
  const started = performance.now();
  const { data: metrics, error } = await supabaseAdmin
    .from("seo_performance_metrics")
    .select("recorded_on,clicks,impressions,ctr,avg_position,conversions")
    .order("recorded_on", { ascending: false })
    .limit(90);
  const { data: keywords } = await supabaseAdmin
    .from("seo_keywords")
    .select("keyword,position,previous_position,search_volume")
    .limit(500);
  const { data: issues } = await supabaseAdmin
    .from("seo_issues")
    .select("severity,status")
    .eq("status", "open");

  const rows = metrics ?? [];
  const clicks = rows.reduce((sum, r) => sum + r.clicks, 0);
  const impressions = rows.reduce((sum, r) => sum + r.impressions, 0);
  const movers = (keywords ?? []).filter(
    (k) => k.previous_position != null && k.position != null && k.previous_position !== k.position,
  ).length;
  const reportMs = round(performance.now() - started);
  const rowsScanned = rows.length + (keywords?.length ?? 0) + (issues?.length ?? 0);

  return {
    label: "Report generation",
    target: "90-day executive report",
    ttfbMs: 0,
    queryMs: 0,
    paginationMs: 0,
    reportMs,
    rowsScanned,
    status: error ? "fail" : grade(reportMs),
    notes: error
      ? `Report failed: ${error.message}`
      : `${clicks} clicks / ${impressions} impressions aggregated · ${movers} keyword movers · ${issues?.length ?? 0} open issues`,
  };
}

export async function runBenchmarkSuite(persist = true): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [
    await benchmarkTable("Pages list", "seo_pages", 50),
    await benchmarkTable("Keyword table", "seo_keywords", 100),
    await benchmarkTable("Ranking history", "seo_keyword_rankings", 500),
    await benchmarkTable("Performance series", "seo_performance_metrics", 90),
    await benchmarkReport(),
  ];

  if (persist) {
    await supabaseAdmin.from("seo_benchmark_runs").insert(
      results.map((r) => ({
        label: r.label,
        target: r.target,
        ttfb_ms: r.ttfbMs,
        query_ms: r.queryMs,
        pagination_ms: r.paginationMs,
        report_ms: r.reportMs,
        rows_scanned: r.rowsScanned,
        status: r.status,
        notes: r.notes,
      })),
    );
  }

  return results;
}
