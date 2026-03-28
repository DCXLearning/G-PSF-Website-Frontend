/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

// better to use server env first, then fallback to NEXT_PUBLIC
const API_BASE_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";

const UPSTREAM = `${API_BASE_URL}/pages/home/section`;

type Lang = "en" | "km";
type I18nText = { en?: string; km?: string };

function pickText(value?: I18nText | string | null, lang: Lang = "en") {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || value.km || "";
}

function normalizeItem(item: any) {
  return {
    label: {
      en: pickText(item?.label, "en"),
      km: pickText(item?.label, "km") || pickText(item?.label, "en"),
    },
    value: {
      en: pickText(item?.value, "en"),
      km: pickText(item?.value, "km") || pickText(item?.value, "en"),
    },
  };
}

export async function GET() {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing API_URL or NEXT_PUBLIC_API_URL in .env",
        },
        { status: 500 }
      );
    }

    const res = await fetch(UPSTREAM, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    // do not directly call res.json() first
    const rawText = await res.text();

    let json: any = null;
    try {
      json = rawText ? JSON.parse(rawText) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            json?.message ||
            `Upstream request failed with status ${res.status}`,
          upstreamStatus: res.status,
          upstreamUrl: UPSTREAM,
        },
        { status: 502 }
      );
    }

    if (!json?.success) {
      return NextResponse.json(
        {
          success: false,
          message: json?.message || "Upstream returned unsuccessful response",
          upstreamUrl: UPSTREAM,
        },
        { status: 502 }
      );
    }

    const blocks = Array.isArray(json?.data?.blocks) ? json.data.blocks : [];

    const heroBlock = blocks.find(
      (b: any) => b?.id === 1 && b?.type === "hero_banner"
    );

    const statsBlock = blocks.find(
      (b: any) => b?.id === 12 && b?.type === "stats"
    );

    const heroPost = heroBlock?.posts?.[0] ?? null;
    const statsPost = statsBlock?.posts?.[0] ?? null;

    const heroEn = heroPost?.content?.en ?? {};
    const heroKm = heroPost?.content?.km ?? {};

    const statsEnRaw = Array.isArray(statsPost?.content?.en?.items)
      ? statsPost.content.en.items
      : [];

    const statsKmRaw = Array.isArray(statsPost?.content?.km?.items)
      ? statsPost.content.km.items
      : [];

    const itemsEn = statsEnRaw.map(normalizeItem);
    const itemsKm =
      statsKmRaw.length > 0
        ? statsKmRaw.map(normalizeItem)
        : statsEnRaw.map(normalizeItem);

    const data = {
      hero: {
        title: heroPost?.title ?? { en: "", km: "" },
        subtitle: heroEn?.subtitle ?? heroKm?.subtitle ?? { en: "", km: "" },
        description:
          heroEn?.description ?? heroKm?.description ?? { en: "", km: "" },
        backgroundImages:
          heroEn?.backgroundImages ?? heroKm?.backgroundImages ?? [],
        ctas: heroEn?.ctas ?? heroKm?.ctas ?? [],
      },
      bannerStats: {
        itemsEn,
        itemsKm,
      },
    };

    return NextResponse.json(
      { success: true, data },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        message: e?.message || "Internal error",
        upstreamUrl: UPSTREAM,
      },
      { status: 500 }
    );
  }
}