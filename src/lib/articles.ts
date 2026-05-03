import type { Lang } from "./i18n";
import { apiClient } from "./api-client";
import { articles as mockArticles, sections, type Article, type Section } from "./mock-data";

export { sections };
export type { Article, Section };

interface DbArticle {
  id: string;
  slug: string;
  section: string;
  status: string;
  title_en: string | null;
  title_ar: string | null;
  title_fr: string | null;
  summary_en: string | null;
  summary_ar: string | null;
  summary_fr: string | null;
  body_en: string | null;
  body_ar: string | null;
  body_fr: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  author_id: string | null;
}

const FALLBACK_AVATAR = "https://i.pravatar.cc/120?u=daleel";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&h=800&q=80";

const VALID_SECTIONS: Section[] = ["politics", "economy", "sports", "tech", "culture", "world"];

function pickLang<T>(map: Record<Lang, T | null | undefined>, lang: Lang, fallback: T): T {
  const v = map[lang];
  if (v != null && v !== "") return v;
  for (const l of ["en", "ar", "fr"] as Lang[]) {
    const f = map[l];
    if (f != null && f !== "") return f;
  }
  return fallback;
}

function readMins(text: string | null | undefined): number {
  if (!text) return 3;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

function paragraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function adaptDbArticle(row: DbArticle): Article {
  const section = (VALID_SECTIONS as string[]).includes(row.section)
    ? (row.section as Section)
    : "world";

  const titleMap = { en: row.title_en, ar: row.title_ar, fr: row.title_fr };
  const summaryMap = { en: row.summary_en, ar: row.summary_ar, fr: row.summary_fr };
  const bodyMap = { en: row.body_en, ar: row.body_ar, fr: row.body_fr };

  const title = {
    en: pickLang(titleMap, "en", row.slug),
    ar: pickLang(titleMap, "ar", row.slug),
    fr: pickLang(titleMap, "fr", row.slug),
  };
  const excerpt = {
    en: pickLang(summaryMap, "en", ""),
    ar: pickLang(summaryMap, "ar", ""),
    fr: pickLang(summaryMap, "fr", ""),
  };
  const body = {
    en: paragraphs(pickLang(bodyMap, "en", "")),
    ar: paragraphs(pickLang(bodyMap, "ar", "")),
    fr: paragraphs(pickLang(bodyMap, "fr", "")),
  };

  // Read time uses the longest body
  const longest = [body.en, body.ar, body.fr].reduce((a, b) => (b.join(" ").length > a.join(" ").length ? b : a), [] as string[]);
  const readTime = readMins(longest.join(" "));

  const tagText = (row.tags ?? []).join(", ");
  const tags = { en: row.tags ?? [], ar: row.tags ?? [], fr: row.tags ?? [] };

  return {
    id: row.id,
    slug: row.slug,
    section,
    image: row.cover_image_url || FALLBACK_IMAGE,
    publishedAt: row.published_at || row.created_at,
    readTime,
    author: {
      name: { en: "Daleel Newsroom", ar: "غرفة أخبار دليل", fr: "Rédaction Daleel" },
      avatar: FALLBACK_AVATAR,
    },
    title,
    excerpt,
    body,
    tags,
  };
}

const SELECT_COLS =
  "id,slug,section,status,title_en,title_ar,title_fr,summary_en,summary_ar,summary_fr,body_en,body_ar,body_fr,cover_image_url,tags,published_at,created_at,author_id";

// Transient PostgREST errors during backend cold-start / schema cache reload.
const TRANSIENT_CODES = new Set(["PGRST001", "PGRST002", "PGRST000", "57P03", "53300"]);

function isTransient(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  return !!code && TRANSIENT_CODES.has(code);
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!isTransient(e) || i === attempts - 1) throw e;
      // 300ms, 700ms, 1500ms backoff
      await new Promise((r) => setTimeout(r, 300 * Math.pow(2, i) + Math.random() * 100));
    }
  }
  throw lastErr;
}

// ---------- In-memory cache + request dedup ----------
// Browser-tab-lifetime cache so repeated route visits don't re-hit Supabase.
// SWR-ish: serves cached data immediately while a background refresh runs
// once the entry passes `STALE_MS`. Single in-flight promise per key dedupes
// concurrent callers.

const FRESH_MS = 60_000;        // serve cached without any refresh for 60s
const STALE_MS = 5 * 60_000;    // after 5min, force a refresh on next call

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

function getCached<T>(key: string): CacheEntry<T> | undefined {
  return cache.get(key) as CacheEntry<T> | undefined;
}

function setCached<T>(key: string, data: T) {
  cache.set(key, { data, fetchedAt: Date.now() });
}

/**
 * Cache + dedup wrapper.
 * - Returns cached data immediately if `< FRESH_MS` old.
 * - Returns cached data immediately if `< STALE_MS` old, kicks off a
 *   background refresh (only if no in-flight request exists for the key).
 * - If older than STALE_MS or missing, awaits a (deduped) fetch.
 */
async function cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const entry = getCached<T>(key);
  const now = Date.now();

  if (entry && now - entry.fetchedAt < FRESH_MS) {
    return entry.data;
  }

  if (entry && now - entry.fetchedAt < STALE_MS) {
    // Stale-while-revalidate: refresh in background, return cached now.
    if (!inflight.has(key)) {
      const p = fetcher()
        .then((data) => { setCached(key, data); return data; })
        .catch((e) => { console.warn(`background refresh failed for ${key}`, e); return entry.data; })
        .finally(() => { inflight.delete(key); });
      inflight.set(key, p);
    }
    return entry.data;
  }

  // No usable cache — dedupe concurrent callers onto the same promise.
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const p = fetcher()
    .then((data) => { setCached(key, data); return data; })
    .finally(() => { inflight.delete(key); });
  inflight.set(key, p);
  return p;
}

/** Manually invalidate cached articles (e.g. after admin publishes a change). */
export function invalidateArticleCache(key?: string) {
  if (key) { cache.delete(key); inflight.delete(key); return; }
  cache.clear();
  inflight.clear();
}

/**
 * Fetch all published articles. Falls back to mock data if the table is empty
 * (so the homepage never looks empty while the newsroom is bootstrapping).
 */
export async function fetchPublishedArticles(): Promise<Article[]> {
  return cached("articles:published", async () => {
    try {
      const data = await withRetry(async () => {
        const response = await apiClient<{ items: DbArticle[] }>("/articles?status=published");
        return response.items;
      });
      if (!data || data.length === 0) return mockArticles;
      return data.map(adaptDbArticle);
    } catch (e) {
      console.warn("fetchPublishedArticles failed, using mock", e);
      return mockArticles;
    }
  });
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  return cached(`article:slug:${slug}`, async () => {
    try {
      const data = await withRetry(async () => {
        const response = await apiClient<DbArticle>(`/articles/${slug}`);
        return response;
      });
      if (data) return adaptDbArticle(data);
    } catch (e) {
      console.warn("fetchArticleBySlug failed", e);
    }
    return mockArticles.find((a) => a.slug === slug) ?? null;
  });
}

export async function fetchArticlesByIds(ids: string[]): Promise<Article[]> {
  if (ids.length === 0) return [];
  // Stable cache key regardless of input order.
  const key = `articles:ids:${[...ids].sort().join(",")}`;
  return cached(key, async () => {
    try {
      // Create a URL with multiple id query parameters: /articles?id=1&id=2
      const urlParams = new URLSearchParams();
      ids.forEach(id => urlParams.append("id", id));
      
      const data = await withRetry(async () => {
        const response = await apiClient<{ items: DbArticle[] }>(`/articles?${urlParams.toString()}`);
        return response.items;
      });
      const fromDb = (data ?? []).map(adaptDbArticle);
      const found = new Set(fromDb.map((a) => a.id));
      const fromMock = mockArticles.filter((a) => ids.includes(a.id) && !found.has(a.id));
      return [...fromDb, ...fromMock];
    } catch (e) {
      console.warn("fetchArticlesByIds failed", e);
      return mockArticles.filter((a) => ids.includes(a.id));
    }
  });
}
