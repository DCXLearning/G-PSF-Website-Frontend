/* eslint-disable @typescript-eslint/no-explicit-any */
// ✅ app/api/newupdate-page/section/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  //  News & Updates section endpoint
  const url = "https://api-gpsf.datacolabx.com/api/v1/pages/news-and-updates/section";

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: `Upstream error ${res.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json(await res.json(), { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || "Fetch failed" },
      { status: 500 }
    );
  }
}