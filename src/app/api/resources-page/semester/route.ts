import { NextResponse } from "next/server";

const FALLBACK_API_BASE = "https://api-gpsf.datacolabx.com/api/v1";

export async function GET() {
  try {
    const apiBase =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      FALLBACK_API_BASE;
    const res = await fetch(
      `${apiBase}/posts/category/17`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch external API" },
        { status: 500 }
      );
    }

    const json = await res.json();

    return NextResponse.json(json);
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
