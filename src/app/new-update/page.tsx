import RouterNewUpdate from "@/components/UI-Router/RouterNewUpdate";
import { API_URL } from "@/config/api";
import type { NewUpdateSectionProps } from "@/components/News&Updates/NewUpdate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_STRIP_LIMIT = 6;

type ApiText = { en?: string; km?: string; kh?: string };

type ApiPostRaw = {
  id?: number;
  slug?: string;
  title?: ApiText;
  description?: ApiText;
  status?: string;
  coverImage?: string | null;
  images?: Array<{ url?: string }>;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  category?: { name?: ApiText };
  workingGroup?: { title?: ApiText } | null;
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

function getLocalizedText(value?: ApiText): LocalizedText {
  const en = getText(value?.en);
  const km = getText(value?.km) || getText(value?.kh) || en;

  return {
    en: en || km,
    km,
  };
}

function timestamp(post: ApiPostRaw): number {
  const value = post.publishedAt || post.createdAt || post.updatedAt || null;
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

function mergeText(primary?: ApiText, fallback?: ApiText): ApiText {
  const primaryText = getLocalizedText(primary);
  const fallbackText = getLocalizedText(fallback);

  return {
    en: primaryText.en || fallbackText.en || fallbackText.km,
    km: primaryText.km || fallbackText.km || fallbackText.en,
  };
}

function mergePost(primary: ApiPostRaw, fallback: ApiPostRaw): ApiPostRaw {
  return {
    ...fallback,
    ...primary,
    title: mergeText(primary.title, fallback.title),
    description: mergeText(primary.description, fallback.description),
    coverImage:
      getText(primary.coverImage ?? undefined) ||
      getText(fallback.coverImage ?? undefined) ||
      null,
    images:
      Array.isArray(primary.images) && primary.images.length > 0
        ? primary.images
        : fallback.images,
    category: primary.category ?? fallback.category,
    workingGroup: primary.workingGroup ?? fallback.workingGroup,
    documents: primary.documents ?? fallback.documents,
  };
}

function toCard(post: ApiPostRaw, fallbackIndex: number): NewUpdateData[number] {
    const titleText = getLocalizedText(post.title);
    const descriptionText = getLocalizedText(post.description);

    return {
        id: post.id ?? fallbackIndex + 1,
    slug: getText(post.slug),
    createdAt:
      getText(post.publishedAt ?? undefined) ||
      getText(post.createdAt) ||
      getText(post.updatedAt),
    category: post.workingGroup?.title
      ? getLocalizedText(post.workingGroup.title)
      : getLocalizedText(post.category?.name),
    title: titleText,
    excerpt: descriptionText,
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

  const configuredLimit = postListBlock?.settings?.limit;
  const stripLimit =
    typeof configuredLimit === "number" && configuredLimit > 0
      ? Math.floor(configuredLimit)
      : DEFAULT_STRIP_LIMIT;

  const wgPosts: ApiPostRaw[] = Array.isArray(wgResp?.data) ? wgResp.data : [];

  const sectionNewsOnly = sectionPosts.filter(
    (post) => post.status === "published" && !isDocumentPost(post)
  );
  const wgPublishedOnly = wgPosts.filter(
    (post) => post.status === "published"
  );

  const byId = new Map<number, ApiPostRaw>();
  for (const post of wgPublishedOnly) {
    if (typeof post.id === "number") byId.set(post.id, post);
  }
  for (const post of sectionNewsOnly) {
    if (typeof post.id !== "number") {
      continue;
    }

    const existingPost = byId.get(post.id);

    if (existingPost) {
      byId.set(post.id, mergePost(existingPost, post));
    } else {
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
    if (!card.title.en && !card.title.km) continue;
    cards.push(card);
    if (cards.length >= stripLimit) break;
  }

  return cards;
}

export default async function Page() {
  const data = await getNewAndUpdateSection();
  return <RouterNewUpdate newUpdateSectionData={data} />;
}
