/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

const API_BASE = API_URL || "";
const UPSTREAM = `${API_BASE}/sections/page/home`;

function normalizeText(value: any) {
  if (!value) return { en: "", km: "" };

  if (typeof value === "string") {
    const text = value.trim();
    return { en: text, km: text };
  }

  return {
    en: typeof value?.en === "string" ? value.en.trim() : "",
    km:
      (typeof value?.km === "string" ? value.km.trim() : "") ||
      (typeof value?.kh === "string" ? value.kh.trim() : "") ||
      (typeof value?.en === "string" ? value.en.trim() : ""),
  };
}

export async function GET() {
  try {
    if (!API_BASE) {
      return NextResponse.json(
        { success: false, message: "Missing API_URL in environment" },
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

    const text = await res.text();

    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok || !json?.success) {
      return NextResponse.json(
        {
          success: false,
          message: json?.message || "Upstream API failed",
          upstreamStatus: res.status,
        },
        { status: res.ok ? 502 : 502 }
      );
    }

    const blocks = Array.isArray(json?.data?.blocks) ? json.data.blocks : [];
    const statsBlock = blocks.find(
      (b: any) => b?.id === 11 && b?.type === "stats"
    );

    const post0 = statsBlock?.posts?.[0] ?? null;
    const itemsRaw = Array.isArray(post0?.content?.en?.items)
      ? post0.content.en.items
      : [];

    const items = itemsRaw.map((item: any) => ({
      label: normalizeText(item?.label),
      value: normalizeText(item?.value),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          blockId: statsBlock?.id ?? null,
          title: normalizeText(statsBlock?.title),
          description: normalizeText(statsBlock?.description),
          items,
        },
      },
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
      { success: false, message: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}