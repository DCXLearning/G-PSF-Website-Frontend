/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type I18n = { en?: string; km?: string };

type ApiPost = {
    id: number;
    title?: I18n;
    description?: I18n;
    coverImage?: string | null;
    slug?: string;
};

type Block = {
    id: number;
    type: string; // "post_list"
    title?: I18n;
    description?: I18n;
    settings?: {
        sort?: "latest" | "oldest";
        limit?: number;
        categoryIds?: number[];
    };
    posts?: ApiPost[];
};

type ApiResponse = {
    success: boolean;
    data?: { blocks?: Block[] };
};

function pickText(obj: I18n | undefined, lang: "en" | "km", fallback = "") {
    if (!obj) return fallback;
    return ((lang === "km" ? obj.km : obj.en) || obj.en || obj.km || fallback).trim();
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const lang = (url.searchParams.get("lang") === "km" ? "km" : "en") as "en" | "km";

        if (!API_URL) {
            return NextResponse.json(
                { success: false, message: "NEXT_PUBLIC_API_URL is missing in .env" },
                { status: 500 }
            );
        }

        // Your backend endpoint (choose the correct one)
        // If your API is: https://api-gpsf.datacolabx.com/api/v1/pages/working-groups
        // then API_URL already includes /api/v1
        const upstream = await fetch(`${API_URL}/pages/working-groups/section`, {
            cache: "no-store",
            headers: { Accept: "application/json" },
        });

        if (!upstream.ok) {
            const text = await upstream.text();
            return new NextResponse(text, { status: upstream.status });
        }

        const json = (await upstream.json()) as ApiResponse;

        const blocks = json?.data?.blocks || [];
        const block =
            blocks.find((b) => b.id === 22) ||
            blocks.find(
                (b) =>
                    b.type === "post_list" &&
                    pickText(b.title, "en").toLowerCase().includes("who participates")
            );

        const posts = block?.posts || [];

        return NextResponse.json({
            success: true,
            data: {
                blockId: block?.id ?? 22,
                title: pickText(block?.title, lang, lang === "km" ? "អ្នកចូលរួម" : "Who Participates"),
                subtitle:
                    pickText(block?.description, lang, "") ||
                    (lang === "km"
                        ? "អង្គប្រជុំក្រុមការងារ រួមបញ្ចូលភាគីពាក់ព័ន្ធជាច្រើនប្រភេទ។"
                        : "Working Group meetings bring together a broad range of stakeholders."),
                items: posts.map((p) => ({
                    id: p.id,
                    slug: p.slug,
                    title: pickText(p.title, lang, "Untitled"),
                    description: pickText(p.description, lang, ""),
                    icon: p.coverImage || "",
                })),
                settings: block?.settings || null,
            },
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Participates API error" },
            { status: 500 }
        );
    }
}