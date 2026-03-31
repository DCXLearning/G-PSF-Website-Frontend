import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

const FALLBACK_API_BASE = "https://api-gpsf.datacolabx.com/api/v1";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const types = (searchParams.get("types") ?? "")
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        const apiBase = (
            process.env.API_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            FALLBACK_API_BASE
        ).replace(/\/$/, "");

        const response = await fetch(`${apiBase}/pages/plenary/section`, {
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

        // Let the frontend request only the block types it needs.
        if (types.length > 0 && Array.isArray(data?.data?.blocks)) {
            data.data.blocks = data.data.blocks.filter((block: { type?: string }) =>
                types.includes(block.type ?? "")
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Fetch failed";

        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        );
    }
}
