/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

const API_BASE = API_URL || "";
const UPSTREAM = `${API_BASE}/pages/home/section`;
const BASE_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");
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

function toAbsoluteUrl(url: string) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${BASE_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
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

        if (!res.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: json?.message || `Upstream error: ${res.status}`,
                    upstreamStatus: res.status,
                },
                { status: 502 }
            );
        }

        const blocks = Array.isArray(json?.data?.blocks) ? json.data.blocks : [];

        const rawBlock = blocks.find(
            (b: any) => b?.type === "post_list" && b?.id === BLOCK_ID
        );

        if (!rawBlock) {
            return NextResponse.json(
                { success: false, message: "Block not found", block: null },
                { status: 404 }
            );
        }

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
                        images: cover ? [{ id: 1, url: cover, sortOrder: 1 }] : [],
                        coverImage: p?.coverImage ?? null,
                        document: p?.document ?? null,
                        documentThumbnail: p?.documentThumbnail ?? null,
                        link: p?.link ?? null,
                    };
                }),
        };

        return NextResponse.json(
            { success: true, block: normalizedBlock },
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
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 }
        );
    }
}