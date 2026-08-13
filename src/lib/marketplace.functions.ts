// Marketplace ↔ Manager data layer.
// Public reads use a server publishable client (RLS enforced as anon).
// Admin mutations use requireSupabaseAuth — RLS enforces boss/admin role.
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type MarketProduct = {
  id: string;
  slug: string;
  name: string;
  industry_label: string | null;
  icon: string;
  price_label: string;
  price_period: string | null;
  rating: number;
  downloads: number;
  downloads_label: string | null;
  badge: "NEW" | "HOT" | "TOP" | "DEAL" | null;
};

export type MarketIndustry = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  image_key: string | null;
  product_count: number;
  tone: string;
};

export type MarketVendor = {
  id: string;
  slug: string;
  name: string;
  country: string | null;
  verified: boolean;
  rating: number;
  product_count: number;
};

export type HomepageSection = {
  key: string;
  title: string;
  enabled: boolean;
  sort_order: number;
};

export type Marketplace = {
  featured: MarketProduct[];
  trending: MarketProduct[];
  bestSellers: MarketProduct[];
  newReleases: MarketProduct[];
  aiProducts: MarketProduct[];
  industries: MarketIndustry[];
  vendors: MarketVendor[];
  sections: HomepageSection[];
};

// ---------- server-only publishable client (public reads) ----------
function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const PRODUCT_COLS =
  "id, slug, name, industry_label, icon, price_label, price_period, rating, downloads, downloads_label, badge";

function toProduct(r: any): MarketProduct {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    industry_label: r.industry_label,
    icon: r.icon ?? "Sparkles",
    price_label: r.price_label ?? "",
    price_period: r.price_period,
    rating: Number(r.rating ?? 0),
    downloads: Number(r.downloads ?? 0),
    downloads_label: r.downloads_label,
    badge: r.badge,
  };
}

// ---------- PUBLIC: aggregated homepage payload ----------
export const getMarketplace = createServerFn({ method: "GET" }).handler(
  async (): Promise<Marketplace> => {
    const sb = publicClient();
    const [featured, trending, best, fresh, ai, cats, vends, sections] = await Promise.all([
      sb.from("marketplace_products").select(PRODUCT_COLS).eq("is_featured", true).order("sort_order").limit(24),
      sb.from("marketplace_products").select(PRODUCT_COLS).eq("is_trending", true).order("sort_order").limit(24),
      sb.from("marketplace_products").select(PRODUCT_COLS).eq("is_best_seller", true).order("sort_order").limit(24),
      sb.from("marketplace_products").select(PRODUCT_COLS).eq("is_new_release", true).order("sort_order").limit(24),
      sb.from("marketplace_products").select(PRODUCT_COLS).eq("is_ai", true).order("sort_order").limit(24),
      sb.from("marketplace_categories").select("id, slug, name, icon, image_key, tone, sort_order").order("sort_order"),
      sb.from("marketplace_vendors").select("id, slug, name, country, verified, rating, product_count").order("rating", { ascending: false }).limit(24),
      sb.from("marketplace_homepage_sections").select("key, title, enabled, sort_order").order("sort_order"),
    ]);
    return {
      featured: (featured.data ?? []).map(toProduct),
      trending: (trending.data ?? []).map(toProduct),
      bestSellers: (best.data ?? []).map(toProduct),
      newReleases: (fresh.data ?? []).map(toProduct),
      aiProducts: (ai.data ?? []).map(toProduct),
      industries: (cats.data ?? []).map((c: any) => ({
        id: c.id, slug: c.slug, name: c.name,
        icon: c.icon ?? "Sparkles",
        image_key: c.image_key,
        product_count: 0,
        tone: c.tone ?? "primary",
      })),
      vendors: (vends.data ?? []).map((v: any) => ({
        id: v.id, slug: v.slug, name: v.name,
        country: v.country, verified: !!v.verified,
        rating: Number(v.rating ?? 0),
        product_count: Number(v.product_count ?? 0),
      })),
      sections: (sections.data ?? []) as HomepageSection[],
    };
  },
);

// ---------- Admin CRUD ----------
const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  industry_label: z.string().nullable().optional(),
  icon: z.string().optional(),
  price_label: z.string().optional(),
  price_period: z.string().nullable().optional(),
  rating: z.number().optional(),
  downloads: z.number().int().optional(),
  downloads_label: z.string().nullable().optional(),
  badge: z.enum(["NEW", "HOT", "TOP", "DEAL"]).nullable().optional(),
  is_featured: z.boolean().optional(),
  is_trending: z.boolean().optional(),
  is_new_release: z.boolean().optional(),
  is_best_seller: z.boolean().optional(),
  is_ai: z.boolean().optional(),
  category_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().optional(),
  visible: z.boolean().optional(),
  publish_at: z.string().nullable().optional(),
  unpublish_at: z.string().nullable().optional(),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => productSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("marketplace_products")
      .upsert(data as any, { onConflict: "slug" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("marketplace_products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listProductsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("marketplace_products")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().optional(),
  image_key: z.string().nullable().optional(),
  tone: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
  is_featured: z.boolean().optional(),
  is_hidden: z.boolean().optional(),
});

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => categorySchema.parse(v))
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("marketplace_categories")
      .upsert(data as any, { onConflict: "slug" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("marketplace_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listCategoriesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("marketplace_categories")
      .select("*")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// Homepage section ordering
export const setSectionEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ key: z.string(), enabled: z.boolean() }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("marketplace_homepage_sections")
      .update({ enabled: data.enabled })
      .eq("key", data.key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderSections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ order: z.array(z.object({ key: z.string(), sort_order: z.number().int() })) }).parse(v))
  .handler(async ({ data, context }) => {
    for (const row of data.order) {
      const { error } = await context.supabase
        .from("marketplace_homepage_sections")
        .update({ sort_order: row.sort_order })
        .eq("key", row.key);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const listSectionsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("marketplace_homepage_sections")
      .select("*")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });
