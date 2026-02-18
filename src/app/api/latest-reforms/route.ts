// src/app/api/latest-reforms/route.ts
import { NextResponse } from "next/server";

const API_URL = "https://api-gpsf.datacolabx.com/api/v1/pages/home/section";
const BLOCK_ID = 6; // Latest Reforms

function cleanText(v: any) {
    const s = typeof v === "string" ? v.trim() : "";
    return !s || s === "." ? "" : s;
}

function cleanI18n(obj: any) {
    const en = cleanText(obj?.en);
    const km = cleanText(obj?.km);
    return { en, km: km || en };
}

// Make absolute URL if thumbnail is relative like "/uploads/thumbnails/xxx.png"
function toAbsoluteUrl(url: string) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://api-gpsf.datacolabx.com${url}`;
}

export async function GET() {
    try {
        const res = await fetch(API_URL, {
            cache: "no-store",
            headers: { Accept: "application/json" },
        });

        if (!res.ok) {
            return NextResponse.json(
                { success: false, message: `Upstream error: ${res.status}` },
                { status: res.status }
            );
        }

        const json = await res.json();
        const blocks = json?.data?.blocks ?? [];

        const rawBlock = blocks.find(
            (b: any) => b?.type === "post_list" && b?.id === BLOCK_ID
        );

        if (!rawBlock) {
            return NextResponse.json(
                { success: false, message: "Block not found", block: null },
                { status: 404 }
            );
        }

        // ✅ normalize block + posts so UI can use post.images[0].url
        const normalizedBlock = {
            id: rawBlock.id,
            type: rawBlock.type,
            title: cleanI18n(rawBlock.title),
            description: cleanI18n(rawBlock.description),
            settings: rawBlock.settings ?? {},
            posts: (rawBlock.posts ?? [])
                .filter((p: any) => p?.status === "published")
                .map((p: any) => {
                    const cover =
                        cleanText(p?.coverImage) ||
                        toAbsoluteUrl(cleanText(p?.documentThumbnail)) ||
                        "";

                    return {
                        id: p.id,
                        slug: cleanText(p?.slug),
                        status: p.status,
                        title: cleanI18n(p?.title),
                        description: cleanI18n(p?.description),
                        content: p?.content ?? null,
                        createdAt: p?.createdAt,
                        updatedAt: p?.updatedAt,

                        // ✅ IMPORTANT: create images[] for your UI
                        images: cover ? [{ id: 1, url: cover, sortOrder: 1 }] : [],

                        // keep originals too (optional)
                        coverImage: p?.coverImage ?? null,
                        document: p?.document ?? null,
                        documentThumbnail: p?.documentThumbnail ?? null,
                        link: p?.link ?? null,
                    };
                }),
        };

        return NextResponse.json(
            { success: true, block: normalizedBlock },
            { status: 200 }
        );
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 }
        );
    }
}