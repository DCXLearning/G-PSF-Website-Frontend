/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const UPSTREAM = "https://api-gpsf.datacolabx.com/api/v1/sections/page/home";

export async function GET() {
  try {
    const res = await fetch(UPSTREAM, { cache: "no-store" });
    const json = await res.json();

    if (!res.ok || !json?.success) {
      return NextResponse.json(
        { success: false, message: json?.message || "Upstream API failed" },
        { status: res.status || 500 }
      );
    }

    const blocks = json?.data?.blocks ?? [];
    const statsBlock = blocks.find((b: any) => b?.id === 11 && b?.type === "stats");

    // optional: return only what FE needs
    const post0 = statsBlock?.posts?.[0] ?? null;
    const items = post0?.content?.en?.items ?? [];

    return NextResponse.json({
      success: true,
      data: {
        blockId: statsBlock?.id,
        title: statsBlock?.title ?? null,
        description: statsBlock?.description ?? null,
        items, // [{label:{en,km}, value:{en,km}}, ...]
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}