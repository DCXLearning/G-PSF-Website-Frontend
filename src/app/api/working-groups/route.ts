// src/app/api/working-groups/route.ts
import { NextResponse } from "next/server";

const EXTERNAL_URL = "https://api-gpsf.datacolabx.com/api/v1/working-groups";

function cleanText(v: any): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s || s === ".") return "";
  return s;
}

function cleanI18n(obj: any) {
  return {
    en: cleanText(obj?.en),
    km: cleanText(obj?.km),
  };
}

export async function GET() {
  try {
    const res = await fetch(EXTERNAL_URL, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch working groups" },
        { status: res.status }
      );
    }

    const json = await res.json();

    // ✅ total from API (example: 2 -> show "2 Work Groups...")
    const total = Number(json?.data?.total ?? 0);

    const rawItems = Array.isArray(json?.data?.items) ? json.data.items : [];

    const items = rawItems
      .filter((g: any) => g?.status === "published")
      .sort((a: any, b: any) => (a?.orderIndex ?? 0) - (b?.orderIndex ?? 0))
      .map((g: any) => ({
        id: g.id,
        title: cleanI18n(g?.page?.title),
        iconUrl: g?.iconUrl ?? "",
        slug: g?.page?.slug ?? "",
      }));

    return NextResponse.json({ total, items });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch working groups" },
      { status: 500 }
    );
  }
}