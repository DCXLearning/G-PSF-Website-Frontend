import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

type ApiPost = {
  section?: {
    blockType?: string;
  } | null;
};

type PostsResponse = {
  data?: ApiPost[];
  items?: ApiPost[];
};

type RouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const apiBase = (API_URL ?? "").replace(/\/$/, "");

    if (!apiBase) {
      return NextResponse.json(
        {
          success: false,
          message: "NEXT_PUBLIC_API_URL is not configured",
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    const types = (searchParams.get("types") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const { categoryId } = await context.params;

    const response = await fetch(
      `${apiBase}/posts/category/${encodeURIComponent(categoryId)}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

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

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}