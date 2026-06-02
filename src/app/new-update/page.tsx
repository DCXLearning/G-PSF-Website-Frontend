// page.tsx
import RouterNewUpdate from "@/components/UI-Router/RouterNewUpdate";
import { API_URL } from "@/config/api";
import type { NewUpdateSectionProps } from "@/components/News&Updates/NewUpdate";

// Always render fresh — the underlying data (section settings, post tags) is
// edited from the admin and we don't want stale Next.js caching.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// /new-update landing page merges two sources (same logic as the see-more page):
//   1. Posts surfaced by the "News & Updates" section (id 4) — admin controls
//      this via section.settings.categoryIds in the dashboard.
//   2. Any post tagged with a Working Group.
// Documents (PDFs) are excluded — those belong on the Publication page.
//
// Default cap when the admin hasn't set section 4's settings.limit. The strip
// is a "Latest" carousel, not the full archive — users use "See More" for that.
const DEFAULT_STRIP_LIMIT = 6;

type ApiPostRaw = {
  id?: number;
  slug?: string;
  title?: { en?: string; km?: string };
  description?: { en?: string; km?: string };
  status?: string;
  coverImage?: string | null;
  images?: Array<{ url?: string }>;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  category?: { name?: { en?: string; km?: string } };
  workingGroup?: { title?: { en?: string; km?: string } } | null;
  documents?: {
    en?: { url?: string } | null;
    km?: { url?: string } | null;
  } | null;
};

type SectionsResponse = {
  data?: {
    blocks?: Array<{
      type?: string;
      enabled?: boolean;
      settings?: {
        // Admin-controlled cap for how many cards the strip shows. Set this
        // on section 4 in the dashboard to override the default.
        limit?: number;
      } | null;
      posts?: ApiPostRaw[];
    }>;
  };
};

type PostsListResponse = {
  data?: ApiPostRaw[];
};

type NewUpdateData = NewUpdateSectionProps["data"];
type LocalizedText = NonNullable<NewUpdateData[number]["category"]>;

function isDocumentPost(post: ApiPostRaw): boolean {
  const enUrl = post.documents?.en?.url?.trim() ?? "";
  const kmUrl = post.documents?.km?.url?.trim() ?? "";
  return Boolean(enUrl || kmUrl);
}

function getText(value?: string | null): string {
  const text = value?.trim() ?? "";
  return text === "." ? "" : text;
}

function getLocalizedText(value?: { en?: string; km?: string }): LocalizedText {
  return {
    en: getText(value?.en),
    km: getText(value?.km),
  };
}

function timestamp(post: ApiPostRaw): number {
  const value = post.publishedAt || post.createdAt || post.updatedAt || null;
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

function toCard(post: ApiPostRaw, fallbackIndex: number): NewUpdateData[number] {
  const title = getText(post.title?.en) || getText(post.title?.km);
  return {
    id: post.id ?? fallbackIndex + 1,
    slug: getText(post.slug),
    createdAt:
      getText(post.publishedAt ?? undefined) ||
      getText(post.createdAt) ||
      getText(post.updatedAt),
    // Prefer the Working Group name as the badge when set, falling back to the
    // post's category. Matches the badge logic on the Publication page.
    category: post.workingGroup?.title
      ? getLocalizedText(post.workingGroup.title)
      : getLocalizedText(post.category?.name),
    title,
    excerpt: getText(post.description?.en) || getText(post.description?.km),
    imageUrl:
      getText(post.coverImage ?? undefined) ||
      getText(post.images?.[0]?.url),
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function getNewAndUpdateSection(): Promise<NewUpdateData> {
  // Run both upstream calls in parallel — no point waiting on either alone.
  const [sectionResp, wgResp] = await Promise.all([
    fetchJson<SectionsResponse>(`${API_URL}/pages/news-and-updates/section`),
    fetchJson<PostsListResponse>(
      `${API_URL}/posts?hasWorkingGroup=true&hasDocument=false&excludeTemplateSections=true&pageSize=50`
    ),
  ]);

  const postListBlock = sectionResp?.data?.blocks?.find(
    (block) => block.enabled === true && block.type === "post_list"
  );
  const sectionPosts: ApiPostRaw[] = postListBlock?.posts ?? [];

  // Admin-controlled cap from section 4's settings.limit in the dashboard.
  // Falls back to DEFAULT_STRIP_LIMIT (6) when not set or invalid.
  const configuredLimit = postListBlock?.settings?.limit;
  const stripLimit =
    typeof configuredLimit === "number" && configuredLimit > 0
      ? Math.floor(configuredLimit)
      : DEFAULT_STRIP_LIMIT;

  const wgPosts: ApiPostRaw[] = Array.isArray(wgResp?.data) ? wgResp.data : [];

  // Section feed may include documents — strip them. WG feed already excludes
  // them server-side via hasDocument=false.
  const sectionNewsOnly = sectionPosts.filter(
    (post) => post.status === "published" && !isDocumentPost(post)
  );
  const wgPublishedOnly = wgPosts.filter(
    (post) => post.status === "published"
  );

  // Merge dedupe by id; prefer the WG-feed copy if both contain the same post
  // (the WG copy is the one with workingGroup populated for the badge).
  const byId = new Map<number, ApiPostRaw>();
  for (const post of wgPublishedOnly) {
    if (typeof post.id === "number") byId.set(post.id, post);
  }
  for (const post of sectionNewsOnly) {
    if (typeof post.id === "number" && !byId.has(post.id)) {
      byId.set(post.id, post);
    }
  }

  const merged = Array.from(byId.values()).sort(
    (a, b) => timestamp(b) - timestamp(a)
  );

  const cards: NewUpdateData = [];
  for (let index = 0; index < merged.length; index += 1) {
    const post = merged[index];
    const card = toCard(post, index);
    if (!card.title) continue;
    cards.push(card);
    if (cards.length >= stripLimit) break;
  }

  return cards;
}

export default async function Page() {
  const data = await getNewAndUpdateSection();
  return <RouterNewUpdate newUpdateSectionData={data} />;
}
