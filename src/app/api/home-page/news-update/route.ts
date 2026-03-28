/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

const API_BASE = API_URL || "";
const UPSTREAM_URL = `${API_BASE}/pages/news-and-updates/section`;
const BASE_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");

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

function toAbsoluteUrl(url?: string | null) {
    const value = typeof url === "string" ? url.trim() : "";
    if (!value) return "";
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return `${BASE_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;
}

export async function GET() {
    try {
        if (!API_BASE) {
            return NextResponse.json(
                { success: false, message: "Missing API_URL in environment" },
                { status: 500 }
            );
        }

        const res = await fetch(UPSTREAM_URL, {
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

        if (!res.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: json?.message || `Upstream error ${res.status}`,
                    upstreamStatus: res.status,
                },
                { status: 502 }
            );
        }

        const blocks = Array.isArray(json?.data?.blocks) ? json.data.blocks : [];

        const newsBlock =
            blocks.find(
                (block: any) =>
                    block?.enabled !== false &&
                    block?.type === "post_list" &&
                    Array.isArray(block?.posts) &&
                    block.posts.length > 0 &&
                    (block?.title?.en === "News & Updates" || block?.id === 4)
            ) || null;

        const posts = Array.isArray(newsBlock?.posts) ? newsBlock.posts : [];

        const items = posts.map((post: any) => {
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
                heading: normalizeText(newsBlock?.title),
                description: normalizeText(newsBlock?.description),
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