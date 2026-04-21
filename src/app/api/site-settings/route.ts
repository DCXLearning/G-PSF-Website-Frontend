import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_API_BASE = "https://api-gpsf.datacolabx.com/api/v1";

export async function GET() {
    try {
        const apiBase = (
            process.env.API_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            FALLBACK_API_BASE
        ).replace(/\/$/, "");

        const upstream = await fetch(`${apiBase}/site-settings/current`, {
            cache: "no-store",
        });

        const data = await upstream.json();
        return NextResponse.json(data, { status: upstream.status });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Proxy error";

        console.error("site-settings proxy error:", error);
        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        );
    }
}
