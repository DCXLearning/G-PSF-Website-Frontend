/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

const API_BASE = API_URL || "";
const BASE_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");

// Home page "News & Updates" strip — show the latest 6 news posts from both
// the configured "News & Updates" section (id 4) AND any post tagged with a
// Working Group. Posts with a document file are excluded — they belong on the
// Publication page, not the news feed.
// This mirrors /api/newupdate-page/detail's merge logic so the home strip and
// the see-more page stay in lockstep.
const SECTION_ID = 4;
const PAGE_SIZE = 6;
const FETCH_POOL = 50; // pool we sample from before sorting/slicing to 6

const HEADING = { en: "News & Updates", km: "ព័ត៌មាន និងបច្ចុប្បន្នភាព" };
const DESCRIPTION = { en: "", km: "" };

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

function toAbsoluteUrl(url?: string | null) {
    const value = typeof url === "string" ? url.trim() : "";
    if (!value) return "";
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return `${BASE_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;
}

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
        if (!API_BASE) {
            return NextResponse.json(
                { success: false, message: "Missing API_URL in environment" },
                { status: 500 }
            );
        }

        const [sectionResp, wgResp] = await Promise.all([
            fetchJson(`${API_BASE}/sections/${SECTION_ID}/posts?pageSize=${FETCH_POOL}`),
            fetchJson(
                `${API_BASE}/posts?hasWorkingGroup=true&hasDocument=false&excludeTemplateSections=true&pageSize=${FETCH_POOL}`
            ),
        ]);

        const sectionPosts: any[] = Array.isArray(sectionResp?.data)
            ? sectionResp.data
            : [];
        const wgPosts: any[] = Array.isArray(wgResp?.data) ? wgResp.data : [];

        // Section posts may contain documents — strip them. WG fetch already excludes via hasDocument=false.
        const sectionNewsOnly = sectionPosts.filter((post) => !hasDocument(post));

        // Merge dedupe by id, sort newest-first, take top N.
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

        const top = Array.from(byId.values())
            .sort((a, b) => timestamp(b) - timestamp(a))
            .slice(0, PAGE_SIZE);

        const items = top.map((post: any) => {
            const id = post?.id ?? "";
            const slug = post?.slug ?? "";
            const safeId = encodeURIComponent(String(id));
            const safeSlug = encodeURIComponent(String(slug));

            return {
                id,
                slug,
                image: toAbsoluteUrl(post?.coverImage || ""),
                title: normalizeText(post?.title),
                description: normalizeText(post?.description),
                link:
                    post?.link ||
                    (slug
                        ? `/new-update/view-detail?id=${safeId}&slug=${safeSlug}`
                        : `/new-update/view-detail?id=${safeId}`),
            };
        });

        return NextResponse.json(
            {
                success: true,
                heading: HEADING,
                description: DESCRIPTION,
                items,
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
            { success: false, message: e?.message || "Fetch failed" },
            { status: 500 }
        );
    }
}
