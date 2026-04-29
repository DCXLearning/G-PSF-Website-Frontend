import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_API_BASE = "https://api-gpsf.datacolabx.com/api/v1";

function getApiBase() {
    return (
        process.env.API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        FALLBACK_API_BASE
    ).replace(/\/$/, "");
}

export async function GET() {
    try {
        const apiBase = getApiBase();

        const upstream = await fetch(`${apiBase}/site-settings/current`, {
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
        });

        const data = await upstream.json().catch(() => ({
            success: false,
            message: "Invalid JSON response from API",
        }));

        return NextResponse.json(data, {
            status: upstream.status,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Proxy error";

        console.error("site-settings proxy error:", error);

        return NextResponse.json(
            {
                success: false,
                message,
            },
            {
                status: 500,
            }
        );
    }
}