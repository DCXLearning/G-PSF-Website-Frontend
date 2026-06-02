/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

// /new-update/see-more shows BOTH sources, deduped and sorted newest-first:
//   1. Posts surfaced by the "News & Updates" section (id 4) — admin controls
//      this via the section's settings.categoryIds in the dashboard.
//   2. Any post tagged with a Working Group — so WG news automatically appears
//      here without re-tagging or section reconfiguration.
// Posts with a document file attached are excluded — those belong on the
// Publication page, not the news feed.
const SECTION_ID = 4;
const PAGE_SIZE = 50;

function hasDocument(post: any): boolean {
  const en = post?.documents?.en?.url;
  const km = post?.documents?.km?.url;
  return Boolean(
    (typeof en === "string" && en.trim()) ||
      (typeof km === "string" && km.trim())
  );
}

function timestamp(post: any): number {
  const value =
    post?.publishedAt || post?.createdAt || post?.updatedAt || null;
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

async function fetchJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const text = await res.text();
    if (!res.ok) return null;
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    if (!API_URL) {
      return NextResponse.json(
        { success: false, message: "Missing NEXT_PUBLIC_API_URL in environment" },
        { status: 500 }
      );
    }

    // Run the two queries in parallel — neither blocks the other.
    const [sectionResp, wgResp] = await Promise.all([
      fetchJson(`${API_URL}/sections/${SECTION_ID}/posts?pageSize=${PAGE_SIZE}`),
      fetchJson(
        `${API_URL}/posts?hasWorkingGroup=true&hasDocument=false&excludeTemplateSections=true&pageSize=${PAGE_SIZE}`
      ),
    ]);

    // /sections/:id/posts returns posts at .data (array); /posts also returns
    // an array at .data thanks to the global response interceptor.
    const sectionPosts: any[] = Array.isArray(sectionResp?.data)
      ? sectionResp.data
      : [];
    const wgPosts: any[] = Array.isArray(wgResp?.data) ? wgResp.data : [];

    // Drop documents from the section feed — the WG feed already excludes them
    // server-side via hasDocument=false.
    const sectionNewsOnly = sectionPosts.filter((post) => !hasDocument(post));

    // Merge dedupe by id, prefer the WG-feed copy if both contain the same post
    // (it's the same record, but inserting WG-first means the order below is stable).
    const byId = new Map<number, any>();
    for (const post of wgPosts) {
      if (typeof post?.id === "number") byId.set(post.id, post);
    }
    for (const post of sectionNewsOnly) {
      if (typeof post?.id === "number" && !byId.has(post.id)) {
        byId.set(post.id, post);
      }
    }

    const merged = Array.from(byId.values())
      .sort((a, b) => timestamp(b) - timestamp(a))
      .slice(0, PAGE_SIZE);

    return NextResponse.json(
      {
        success: true,
        message: "OK",
        total: merged.length,
        data: merged,
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
  } catch (error: any) {
    console.error("[newupdate-page/detail] proxy error", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
