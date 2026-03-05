import { NextResponse } from "next/server";

const UPSTREAM = "https://api-gpsf.datacolabx.com/api/v1/pages/home/section";

export async function GET() {
  try {
    const res = await fetch(UPSTREAM, { cache: "no-store" });
    const json = await res.json();

    if (!res.ok || !json?.success) {
      return NextResponse.json(
        { success: false, message: json?.message || "Upstream failed" },
        { status: res.status || 500 }
      );
    }

    const blocks = json?.data?.blocks ?? [];

    // HERO block id=1
    const heroBlock = blocks.find((b: any) => b?.id === 1 && b?.type === "hero_banner");
    const heroPost = heroBlock?.posts?.[0] ?? null;

    // STATS block id=12 (State 1 home page)
    const statsBlock = blocks.find((b: any) => b?.id === 12 && b?.type === "stats");
    const statsPost = statsBlock?.posts?.[0] ?? null;

    // ✅ Hero content is inside post.content.en / post.content.km
    const heroEn = heroPost?.content?.en ?? {};
    const heroKm = heroPost?.content?.km ?? {};

    const data = {
      hero: {
        title: heroEn?.title ?? heroKm?.title ?? { en: "", km: "" },
        subtitle: heroEn?.subtitle ?? heroKm?.subtitle ?? { en: "", km: "" },
        description: heroEn?.description ?? heroKm?.description ?? { en: "", km: "" },
        backgroundImages: heroEn?.backgroundImages ?? heroKm?.backgroundImages ?? [],
        ctas: heroEn?.ctas ?? heroKm?.ctas ?? [],
      },
      bannerStats: {
        itemsEn: statsPost?.content?.en?.items ?? [],
        itemsKm: statsPost?.content?.km?.items ?? [],
      },
    };

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}