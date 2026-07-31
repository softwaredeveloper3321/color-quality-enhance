import { useSyncExternalStore } from "react";

export type DemoEnvironment = "production" | "staging" | "testing";
export type DemoHealth = "working" | "slow" | "offline" | "unknown";

export interface DemoUrl {
  id: string;
  productId: string;
  demoName: string;
  roleName: string;
  url: string;
  username: string;
  password: string;
  description: string;
  environment: DemoEnvironment;
  active: boolean;
  lastChecked: string | null;
  responseTimeMs: number | null;
  httpStatus: number | null;
  health: DemoHealth;
  ssl: boolean | null;
  loginPageAccessible: boolean | null;
}

export interface DemoProduct {
  id: string;
  name: string;
}

interface DemoState {
  products: DemoProduct[];
  demos: DemoUrl[];
}

const STORAGE_KEY = "sv.marketplace.demoUrls.v1";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function seed(): DemoState {
  const products: DemoProduct[] = [
    { id: "p-school", name: "School ERP Suite" },
    { id: "p-hospital", name: "Hospital Management" },
    { id: "p-market", name: "Multi-Vendor Marketplace" },
  ];
  const base = (
    productId: string,
    demoName: string,
    roleName: string,
    url: string,
    username: string,
    password: string,
    environment: DemoEnvironment,
  ): DemoUrl => ({
    id: uid(),
    productId,
    demoName,
    roleName,
    url,
    username,
    password,
    description: `${roleName} access for ${demoName}`,
    environment,
    active: true,
    lastChecked: null,
    responseTimeMs: null,
    httpStatus: null,
    health: "unknown",
    ssl: url.startsWith("https://"),
    loginPageAccessible: null,
  });

  return {
    products,
    demos: [
      base("p-school", "School ERP Admin Demo", "Admin", "https://example.com/admin", "admin@demo.com", "Admin@123", "production"),
      base("p-school", "School ERP Teacher Demo", "Teacher", "https://example.com/teacher", "teacher@demo.com", "Teach@123", "production"),
      base("p-school", "School ERP Student Demo", "Student", "https://example.com/student", "student@demo.com", "Stud@123", "staging"),
      base("p-hospital", "Hospital Super Admin", "Super Admin", "https://example.org/superadmin", "super@demo.com", "Super@123", "production"),
      base("p-market", "Marketplace Vendor Demo", "Vendor", "https://example.net/vendor", "vendor@demo.com", "Vend@123", "testing"),
    ],
  };
}

let state: DemoState = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}


function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (Array.isArray(parsed?.demos) && Array.isArray(parsed?.products)) {
        state = parsed;
        emit();
      }
    }
  } catch {
    /* ignore malformed storage */
  }
}

function setState(next: DemoState) {
  state = next;
  persist();
  emit();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDemoState(): DemoState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

export type DemoDraft = Omit<
  DemoUrl,
  "id" | "lastChecked" | "responseTimeMs" | "httpStatus" | "health" | "ssl" | "loginPageAccessible"
>;

export function addDemo(draft: DemoDraft): DemoUrl {
  const demo: DemoUrl = {
    ...draft,
    id: uid(),
    lastChecked: null,
    responseTimeMs: null,
    httpStatus: null,
    health: "unknown",
    ssl: draft.url.toLowerCase().startsWith("https://"),
    loginPageAccessible: null,
  };
  setState({ ...state, demos: [demo, ...state.demos] });
  return demo;
}

export function updateDemo(id: string, patch: Partial<DemoUrl>) {
  setState({
    ...state,
    demos: state.demos.map((d) => (d.id === id ? { ...d, ...patch } : d)),
  });
}

export function deleteDemo(id: string) {
  setState({ ...state, demos: state.demos.filter((d) => d.id !== id) });
}

export function duplicateDemo(id: string) {
  const source = state.demos.find((d) => d.id === id);
  if (!source) return;
  const copy: DemoUrl = {
    ...source,
    id: uid(),
    demoName: `${source.demoName} (Copy)`,
    lastChecked: null,
    responseTimeMs: null,
    httpStatus: null,
    health: "unknown",
    loginPageAccessible: null,
  };
  const index = state.demos.findIndex((d) => d.id === id);
  const demos = [...state.demos];
  demos.splice(index + 1, 0, copy);
  setState({ ...state, demos });
}

export function toggleDemo(id: string) {
  const demo = state.demos.find((d) => d.id === id);
  if (demo) updateDemo(id, { active: !demo.active });
}

export function addProduct(name: string): DemoProduct {
  const product = { id: uid(), name };
  setState({ ...state, products: [...state.products, product] });
  return product;
}
