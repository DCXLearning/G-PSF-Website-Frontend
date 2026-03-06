/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

const UPSTREAM = "https://api-gpsf.datacolabx.com/api/v1/pages/home/section";

type I18nText = { en?: string; km?: string };

function pickText(value?: I18nText | null, lang: "en" | "km" = "en") {
  if (!value) return "";
  return value[lang] || value.en || value.km || "";
}

export async function GET() {
  try {
    const res = await fetch(UPSTREAM, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    const json = await res.json();

    if (!res.ok || !json?.success) {
      return NextResponse.json(
        { success: false, message: json?.message || "Upstream failed" },
        { status: res.status || 500 }
      );
    }

    const blocks = json?.data?.blocks ?? [];

    const heroBlock = blocks.find(
      (b: any) => b?.id === 1 && b?.type === "hero_banner"
    );
    const heroPost = heroBlock?.posts?.[0] ?? null;

    const statsBlock = blocks.find(
      (b: any) => b?.id === 12 && b?.type === "stats"
    );
    const statsPost = statsBlock?.posts?.[0] ?? null;

    const heroEn = heroPost?.content?.en ?? {};
    const heroKm = heroPost?.content?.km ?? {};

    const statsEnRaw = statsPost?.content?.en?.items ?? [];
    const statsKmRaw = statsPost?.content?.km?.items ?? [];

    const itemsEn = statsEnRaw.map((item: any) => ({
      label: {
        en: pickText(item?.label, "en"),
        km: pickText(item?.label, "km") || pickText(item?.label, "en"),
      },
      value: {
        en: pickText(item?.value, "en"),
        km: pickText(item?.value, "km") || pickText(item?.value, "en"),
      },
    }));

    const itemsKm =
      statsKmRaw.length > 0
        ? statsKmRaw.map((item: any) => ({
            label: {
              en: pickText(item?.label, "en"),
              km: pickText(item?.label, "km") || pickText(item?.label, "en"),
            },
            value: {
              en: pickText(item?.value, "en"),
              km: pickText(item?.value, "km") || pickText(item?.value, "en"),
            },
          }))
        : statsEnRaw.map((item: any) => ({
            label: {
              en: pickText(item?.label, "en"),
              km: pickText(item?.label, "km") || pickText(item?.label, "en"),
            },
            value: {
              en: pickText(item?.value, "en"),
              km: pickText(item?.value, "km") || pickText(item?.value, "en"),
            },
          }));

    const data = {
      hero: {
        title: heroEn?.title ?? heroKm?.title ?? { en: "", km: "" },
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
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}