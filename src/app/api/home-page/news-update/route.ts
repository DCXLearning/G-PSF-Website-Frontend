/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

const UPSTREAM_URL =
    "https://api-gpsf.datacolabx.com/api/v1/pages/news-and-updates/section";

function normalizeText(value: any) {
    if (!value) return { en: "", km: "" };

    if (typeof value === "string") {
        return { en: value, km: value };
    }

    return {
        en: value?.en ?? "",
        km: value?.km ?? value?.kh ?? "",
    };
}

export async function GET() {
    try {
        const res = await fetch(UPSTREAM_URL, {
            cache: "no-store",
            headers: { Accept: "application/json" },
        });

        if (!res.ok) {
            return NextResponse.json(
                { success: false, message: `Upstream error ${res.status}` },
                { status: 502 }
            );
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
            const text = await res.text();
            return NextResponse.json(
                {
                    success: false,
                    message: "Upstream did not return JSON",
                    preview: text.slice(0, 200),
                },
                { status: 502 }
            );
        }

        const json = await res.json();
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
                image: post?.coverImage || "",
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
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json(
            { success: false, message: e?.message || "Fetch failed" },
            { status: 500 }
        );
    }
}