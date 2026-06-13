import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        const apiBase = (API_URL ?? "").replace(/\/$/, "");

        if (!apiBase) {
            return NextResponse.json(
                {
                    success: false,
                    message: "NEXT_PUBLIC_API_URL is not configured",
                },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);

        const slug = searchParams.get("slug")?.trim() || "publication";

        const types = (searchParams.get("types") ?? "")
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

        const encodedSlug = slug
            .split("/")
            .filter(Boolean)
            .map(encodeURIComponent)
            .join("/");

        const upstream = `${apiBase}/pages/${encodedSlug}/section`;

        const response = await fetch(upstream, {
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: `Upstream error ${response.status}` },
                { status: 502 }
            );
        }

        const data = await response.json();

        if (types.length > 0 && Array.isArray(data?.data?.blocks)) {
            data.data.blocks = data.data.blocks.filter((block: { type?: string }) =>
                types.includes(block.type ?? "")
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Fetch failed";

        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}