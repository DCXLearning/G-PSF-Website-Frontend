// src/app/api/working-groups/route.ts
import { NextResponse } from "next/server";

const EXTERNAL_URL = "https://api-gpsf.datacolabx.com/api/v1/working-groups";

type I18nRaw = {
  en?: unknown;
  km?: unknown;
};

type WorkingGroupRaw = {
  id?: unknown;
  status?: unknown;
  orderIndex?: unknown;
  iconUrl?: unknown;
  page?: {
    title?: I18nRaw;
    slug?: unknown;
  };
};

type WorkingGroupsUpstreamResponse = {
  data?: {
    total?: unknown;
    items?: unknown;
  };
};

function cleanText(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s || s === ".") {
    return "";
  }

  return s;
}

function cleanI18n(obj: I18nRaw | undefined) {
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

    const json = (await res.json()) as WorkingGroupsUpstreamResponse;

    // ✅ total from API (example: 2 -> show "2 Work Groups...")
    const total = Number(json?.data?.total ?? 0);

    const rawItems: WorkingGroupRaw[] = Array.isArray(json?.data?.items)
      ? (json.data?.items as WorkingGroupRaw[])
      : [];

    const items = rawItems
      .filter((g) => cleanText(g?.status) === "published")
      .sort((a, b) => Number(a?.orderIndex ?? 0) - Number(b?.orderIndex ?? 0))
      .map((g) => ({
        id: Number(g.id ?? 0),
        title: cleanI18n(g?.page?.title),
        iconUrl: cleanText(g?.iconUrl),
        slug: cleanText(g?.page?.slug),
        orderIndex: Number.isFinite(Number(g?.orderIndex))
          ? Number(g?.orderIndex)
          : 0,
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
