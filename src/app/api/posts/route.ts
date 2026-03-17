import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

const FALLBACK_API_BASE = "https://api-gpsf.datacolabx.com/api/v1";

type ApiPost = {
  section?: {
    blockType?: string;
  } | null;
};

type PostsResponse = {
  data?: ApiPost[];
  items?: ApiPost[];
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId")?.trim() ?? "";
    const pageSlug = searchParams.get("pageSlug")?.trim() ?? "";
    const search = searchParams.get("search")?.trim() ?? "";
    const types = (searchParams.get("types") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_BASE;
    const upstreamUrl = new URL(`${apiBase}/posts`);

    // Support page slug when a caller has it.
    if (pageSlug) {
      upstreamUrl.searchParams.set("pageSlug", pageSlug);
    }

    // Support page id too because some pages use the numeric id directly.
    if (pageId) {
      upstreamUrl.searchParams.set("pageId", pageId);
    }

    if (search) {
      upstreamUrl.searchParams.set("search", search);
    }

    const response = await fetch(upstreamUrl.toString(), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `Upstream error ${response.status}` },
        { status: 502 }
      );
    }

    const data = (await response.json()) as PostsResponse;

    if (types.length > 0) {
      if (Array.isArray(data.data)) {
        data.data = data.data.filter((post) =>
          types.includes(post.section?.blockType ?? "")
        );
      }

      if (Array.isArray(data.items)) {
        data.items = data.items.filter((post) =>
          types.includes(post.section?.blockType ?? "")
        );
      }
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Fetch failed";

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
