// page.tsx
import RouterNewUpdate from "@/components/UI-Router/RouterNewUpdate";
import { API_URL } from "@/config/api";
import type { NewUpdateSectionProps } from "@/components/News&Updates/NewUpdate";

type CmsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    blocks?: Array<{
      type?: string;
      enabled?: boolean;
      posts?: Array<{
        id?: number;
        slug?: string;
        title?: { en?: string; km?: string };
        description?: { en?: string; km?: string };
        status?: string;
        coverImage?: string | null; // ✅ from API
        images?: Array<{ url?: string }>;
        createdAt?: string;
        updatedAt?: string;
        category?: { name?: { en?: string; km?: string } };
      }>;
    }>;
  };
};

type NewUpdateData = NewUpdateSectionProps["data"];

function mapNewsPosts(response: CmsResponse): NewUpdateData {
  const blocks = response.data?.blocks ?? [];
  const postListBlock = blocks.find(
    (block) => block.enabled === true && block.type === "post_list"
  );

  const posts = postListBlock?.posts ?? [];
  const mappedPosts: NewUpdateData = [];

  const getText = (value?: string): string => {
    const text = value?.trim() ?? "";
    return text === "." ? "" : text;
  };

  for (let index = 0; index < posts.length; index += 1) {
    const post = posts[index];
    if (post.status !== "published") continue;

    const title = getText(post.title?.en) || getText(post.title?.km);
    if (!title) continue;

    mappedPosts.push({
      id: post.id ?? index + 1,
      slug: getText(post.slug),
      createdAt: getText(post.createdAt) || getText(post.updatedAt),
      group: getText(post.category?.name?.en) || getText(post.category?.name?.km),
      title,
      excerpt: getText(post.description?.en) || getText(post.description?.km),
      // ✅ prefer coverImage, fallback to images[0].url
      imageUrl: getText(post.coverImage ?? undefined) || getText(post.images?.[0]?.url),
    });
  }

  return mappedPosts;
}

async function getNewAndUpdateSection(): Promise<NewUpdateData> {
  const res = await fetch(`${API_URL}/pages/news-and-updates/section`, {
    cache: "no-store",
  });

  const json = (await res.json()) as CmsResponse;
  return mapNewsPosts(json);
}

export default async function Page() {
  const data = await getNewAndUpdateSection();
  return <RouterNewUpdate newUpdateSectionData={data} />;
}