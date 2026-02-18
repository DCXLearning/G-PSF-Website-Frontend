// app/api/logos/route.ts
import { NextResponse } from "next/server";

const API_BASE = "https://api-gpsf.datacolabx.com";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/logo`, {
      // optional: avoid caching issues while developing
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream API error", status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Ensure logo.url becomes absolute (https://api-gpsf.../uploads/xxx)
    if (data?.data?.logos && Array.isArray(data.data.logos)) {
      data.data.logos = data.data.logos.map((l: any) => ({
        ...l,
        url: l?.url?.startsWith("http") ? l.url : `${API_BASE}${l.url}`,
      }));
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch logos" }, { status: 500 });
  }
}