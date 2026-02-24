import { NextResponse } from "next/server";

export async function GET() {
  const upstream =
    "https://api-gpsf.datacolabx.com/api/v1/pages/resources/section";

  const res = await fetch(upstream, {
    // no-store so always fresh in dev
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await res.text(); // safer if upstream returns non-json errors

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
      // optional cache headers
      "Cache-Control": "no-store",
    },
  });
}