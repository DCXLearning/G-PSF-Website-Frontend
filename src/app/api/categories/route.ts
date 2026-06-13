import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

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

    const upstreamUrl = new URL(`${apiBase}/categories`);

    if (pageSlug) {
      upstreamUrl.searchParams.set("pageSlug", pageSlug);
    }

    if (pageId) {
      upstreamUrl.searchParams.set("pageId", pageId);
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

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Fetch failed";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}