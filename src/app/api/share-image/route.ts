import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url")?.trim() ?? "";

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: "Missing image url" },
        { status: 400 },
      );
    }

    let targetUrl: URL;

    try {
      targetUrl = new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid image url" },
        { status: 400 },
      );
    }

    if (!["http:", "https:"].includes(targetUrl.protocol)) {
      return NextResponse.json(
        { success: false, message: "Unsupported image protocol" },
        { status: 400 },
      );
    }

    const upstreamResponse = await fetch(targetUrl.toString(), {
      cache: "no-store",
      headers: {
        Accept: "image/*,*/*;q=0.8",
      },
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      return NextResponse.json(
        { success: false, message: `Upstream error ${upstreamResponse.status}` },
        { status: 502 },
      );
    }

    const contentType =
      upstreamResponse.headers.get("content-type") || "image/jpeg";
    const contentLength = upstreamResponse.headers.get("content-length");

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(upstreamResponse.body, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Image proxy failed";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
