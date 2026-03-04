
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // safer for remote fetch + images
export const revalidate = 0;     // always fresh (no cache)

const UPSTREAM = "https://api-gpsf.datacolabx.com/api/v1/pages/working-groups/section";

export async function GET() {
  try {
    const res = await fetch(UPSTREAM, {
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
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Fetch failed" },
      { status: 500 }
    );
  }
}