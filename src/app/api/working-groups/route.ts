import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  return !s || s === "." ? "" : s;
}

function cleanI18n(obj: I18nRaw | undefined) {
  return {
    en: cleanText(obj?.en),
    km: cleanText(obj?.km),
  };
}

export async function GET() {
  try {
    if (!API_URL) {
      return NextResponse.json(
        { error: "API_URL is not configured" },
        { status: 500 }
      );
    }

    const externalUrl = `${API_URL.replace(/\/$/, "")}/working-groups`;

    const res = await fetch(externalUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch working groups",
          upstreamStatus: res.status,
          url: externalUrl,
        },
        { status: 502 }
      );
    }

    const json = (await res.json()) as WorkingGroupsUpstreamResponse;

    const total = Number(json?.data?.total ?? 0);

    const rawItems: WorkingGroupRaw[] = Array.isArray(json?.data?.items)
      ? (json.data.items as WorkingGroupRaw[])
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
  } catch (err: any) {
    console.error("working-groups proxy error:", err);

    return NextResponse.json(
      {
        error: "Backend API not reachable",
        detail: err?.message || "Unknown error",
      },
      { status: 502 }
    );
  }
}