/**
 * LOCAL DATA CLIENT SHIM
 * Provides the same chainable surface the copied modules expect
 * (`from().select().eq().single()`, `auth.*`, `functions.invoke`)
 * so the cockpit runs fully offline with in-memory demo data.
 */

type Result<T = unknown> = { data: T | null; error: null | { message: string } };

const ok = <T>(data: T): Promise<Result<T>> => Promise.resolve({ data, error: null });

interface QueryBuilder extends PromiseLike<Result<Record<string, unknown>[]>> {
  select: (cols?: string) => QueryBuilder;
  insert: (rows: unknown) => QueryBuilder;
  update: (values: unknown) => QueryBuilder;
  delete: () => QueryBuilder;
  eq: (col: string, value: unknown) => QueryBuilder;
  neq: (col: string, value: unknown) => QueryBuilder;
  in: (col: string, value: unknown) => QueryBuilder;
  order: (col: string, opts?: unknown) => QueryBuilder;
  limit: (n: number) => QueryBuilder;
  single: () => Promise<Result<Record<string, unknown>>>;
  maybeSingle: () => Promise<Result<Record<string, unknown>>>;
}

function createQueryBuilder(): QueryBuilder {
  const rows: Record<string, unknown>[] = [];
  const builder = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    in: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => ok<Record<string, unknown>>({}),
    maybeSingle: () => ok<Record<string, unknown>>({}),
    then: (resolve: (value: Result<Record<string, unknown>[]>) => unknown) =>
      Promise.resolve({ data: rows, error: null } as Result<Record<string, unknown>[]>).then(resolve),
  } as unknown as QueryBuilder;
  return builder;
}

export const supabase = {
  from: (_table: string) => createQueryBuilder(),
  auth: {
    getUser: () => ok({ user: null }),
    getSession: () => ok({ session: null }),
    updateUser: (_values: unknown) => ok({ user: null }),
    signOut: () => ok({}),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  functions: {
    invoke: (_name: string, _opts?: unknown) =>
      ok({ result: "AI service is running in local cockpit mode." }),
  },
  channel: (_name: string) => ({
    on: () => ({ subscribe: () => ({}) }),
    subscribe: () => ({}),
  }),
  removeChannel: (_channel: unknown) => {},
};

export default supabase;
