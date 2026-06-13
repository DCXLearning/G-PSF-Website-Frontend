/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

const SECTION_ID = 4;
const PAGE_SIZE = 50;

function cleanText(value: any) {
  const text = typeof value === "string" ? value.trim() : "";
  return text === "." ? "" : text;
}

function normalizeText(value: any) {
  if (!value) return { en: "", km: "" };

  if (typeof value === "string") {
    const text = cleanText(value);
    return { en: text, km: text };
  }

  const en = cleanText(value?.en);
  const km = cleanText(value?.km) || cleanText(value?.kh) || en;

  return {
    en: en || km,
    km,
  };
}

function mergeText(primary: any, fallback: any) {
  const primaryText = normalizeText(primary);
  const fallbackText = normalizeText(fallback);

  return {
    en: primaryText.en || fallbackText.en || fallbackText.km,
    km: primaryText.km || fallbackText.km || fallbackText.en,
  };
}

function hasDocument(post: any): boolean {
  const en = post?.documents?.en?.url;
  const km = post?.documents?.km?.url;
  return Boolean(
    (typeof en === "string" && en.trim()) ||
      (typeof km === "string" && km.trim())
  );
}

function mergePost(primary: any, fallback: any) {
  return {
    ...fallback,
    ...primary,
    title: mergeText(primary?.title, fallback?.title),
    description: mergeText(primary?.description, fallback?.description),
    coverImage: cleanText(primary?.coverImage) || cleanText(fallback?.coverImage),
    images:
      Array.isArray(primary?.images) && primary.images.length > 0
        ? primary.images
        : fallback?.images,
    category: primary?.category ?? fallback?.category,
    workingGroup: primary?.workingGroup ?? fallback?.workingGroup,
    documents: primary?.documents ?? fallback?.documents,
  };
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

    const sectionPosts: any[] = Array.isArray(sectionResp?.data)
      ? sectionResp.data
      : [];
    const wgPosts: any[] = Array.isArray(wgResp?.data) ? wgResp.data : [];

    const sectionNewsOnly = sectionPosts.filter((post) => !hasDocument(post));

    const byId = new Map<number, any>();
    for (const post of wgPosts) {
      if (typeof post?.id === "number") byId.set(post.id, post);
    }
    for (const post of sectionNewsOnly) {
      if (typeof post?.id !== "number") {
        continue;
      }

      const existingPost = byId.get(post.id);

      if (existingPost) {
        byId.set(post.id, mergePost(existingPost, post));
      } else {
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
