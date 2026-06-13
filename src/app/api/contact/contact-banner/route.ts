/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

function cleanText(v: any) {
    const s = typeof v === "string" ? v.trim() : "";
    return !s || s === "." ? "" : s;
}

function pickLang(obj: any) {
    return cleanText(obj?.en) || cleanText(obj?.km) || "";
}

export async function GET() {
    try {
        const apiBase = (API_URL ?? "").replace(/\/$/, "");

        if (!apiBase) {
            return NextResponse.json(
                { success: false, message: "NEXT_PUBLIC_API_URL is not configured" },
                { status: 500 }
            );
        }

        const res = await fetch(`${apiBase}/pages/contact-us/section`, {
            cache: "no-store",
            headers: { Accept: "application/json" },
        });

        if (!res.ok) {
            return NextResponse.json(
                { success: false, message: `Upstream error ${res.status}` },
                { status: res.status }
            );
        }

        const json = await res.json();

        const block = json?.data?.blocks?.find(
            (b: any) => b?.enabled === true && b?.type === "hero_banner"
        );

        const post = block?.posts?.[0];

        const imageUrl =
            post?.content?.en?.backgroundImages?.[0] ||
            post?.content?.km?.backgroundImages?.[0] ||
            "";

        const title = pickLang(post?.title);
        const description = pickLang(post?.description);

        return NextResponse.json({
            success: true,
            banner: {
                title,
                description,
                imageUrl,
            },
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Server error" },
            { status: 500 }
        );
    }
}