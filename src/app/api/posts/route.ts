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

export async function GET(request: Request) {
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

    const pageId = searchParams.get("pageId")?.trim() ?? "";
    const pageSlug = searchParams.get("pageSlug")?.trim() ?? "";
    const search = searchParams.get("search")?.trim() ?? "";
    const isFeatured = searchParams.get("isFeatured")?.trim() ?? "";
    const categoryId = searchParams.get("categoryId")?.trim() ?? "";
    const sectionId = searchParams.get("sectionId")?.trim() ?? "";
    const dateRange = searchParams.get("dateRange")?.trim() ?? "";
    const workingGroupIds = searchParams.get("workingGroupIds")?.trim() ?? "";
    const hasWorkingGroup = searchParams.get("hasWorkingGroup")?.trim() ?? "";
    const hasDocument = searchParams.get("hasDocument")?.trim() ?? "";
    const excludeTemplateSections =
      searchParams.get("excludeTemplateSections")?.trim() ?? "";
    const pageSize = searchParams.get("pageSize")?.trim() ?? "";

    const types = (searchParams.get("types") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const upstreamUrl = new URL(`${apiBase}/posts`);

    if (pageSlug) upstreamUrl.searchParams.set("pageSlug", pageSlug);
    if (pageId) upstreamUrl.searchParams.set("pageId", pageId);
    if (search) upstreamUrl.searchParams.set("search", search);
    if (isFeatured) upstreamUrl.searchParams.set("isFeatured", isFeatured);
    if (categoryId) upstreamUrl.searchParams.set("categoryId", categoryId);
    if (sectionId) upstreamUrl.searchParams.set("sectionId", sectionId);
    if (dateRange) upstreamUrl.searchParams.set("dateRange", dateRange);
    if (workingGroupIds)
      upstreamUrl.searchParams.set("workingGroupIds", workingGroupIds);
    if (hasWorkingGroup)
      upstreamUrl.searchParams.set("hasWorkingGroup", hasWorkingGroup);
    if (hasDocument) upstreamUrl.searchParams.set("hasDocument", hasDocument);
    if (excludeTemplateSections)
      upstreamUrl.searchParams.set(
        "excludeTemplateSections",
        excludeTemplateSections
      );
    if (pageSize) upstreamUrl.searchParams.set("pageSize", pageSize);

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

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}