
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // safer for remote fetch + images
export const revalidate = 0;     // always fresh (no cache)

const FALLBACK_API_BASE = "https://api-gpsf.datacolabx.com/api/v1hg";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim() || "working-groups";
    const apiBase = process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_BASE;
    const upstream = `${apiBase}/pages/${encodeURIComponent(slug)}/section`;

    const res = await fetch(upstream, {
      // If upstream sends cache headers you don't want, keep no-store
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: `Upstream error ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Pass-through (you can also "shape" the response here if you want)
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Fetch failed";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
