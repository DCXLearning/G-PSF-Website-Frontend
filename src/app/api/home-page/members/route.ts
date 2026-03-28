/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

const API_BASE = API_URL || "";
const UPSTREAM = `${API_BASE}/testimonials`;

function cleanText(v: any) {
    return typeof v === "string" ? v.trim() : "";
}

function cleanI18n(v: any) {
    return {
        en: cleanText(v?.en),
        km: cleanText(v?.km) || cleanText(v?.en),
    };
}

function toAbsoluteUrl(url?: string | null) {
    const value = typeof url === "string" ? url.trim() : "";
    if (!value) return "";
    if (value.startsWith("http://") || value.startsWith("https://")) return value;

    const baseOrigin = API_BASE.replace(/\/api\/v1\/?$/, "");
    return `${baseOrigin}${value.startsWith("/") ? "" : "/"}${value}`;
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
                    message: json?.message || `Failed to fetch testimonials: ${res.status}`,
                    upstreamStatus: res.status,
                },
                { status: 502 }
            );
        }

        const raw =
            json?.data?.items ??
            json?.data ??
            (Array.isArray(json) ? json : []);

        const list = Array.isArray(raw) ? raw : [];

        const items = list
            .filter((t: any) => (t?.status ?? "published") === "published")
            .sort((a: any, b: any) => (a?.orderIndex ?? 0) - (b?.orderIndex ?? 0))
            .map((t: any) => ({
                id: t?.id,
                orderIndex: t?.orderIndex ?? 0,
                rating: Number(t?.rating ?? 5),
                title: cleanI18n(t?.title),
                quote: cleanI18n(t?.quote),
                authorName: cleanI18n(t?.authorName),
                authorRole: cleanI18n(t?.authorRole),
                company: cleanText(t?.company),
                avatarUrl: toAbsoluteUrl(t?.avatarUrl),
            }));

        return NextResponse.json(
            { success: true, items },
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
            { success: false, message: e?.message || "Server error fetching testimonials" },
            { status: 500 }
        );
    }
}