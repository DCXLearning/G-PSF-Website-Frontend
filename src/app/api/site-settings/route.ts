import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function getApiBase() {
    return (API_URL ?? "").replace(/\/$/, "");
}

export async function GET() {
    try {
        const apiBase = getApiBase();

        if (!apiBase) {
            return NextResponse.json(
                {
                    success: false,
                    message: "NEXT_PUBLIC_API_URL is not configured",
                },
                { status: 500 }
            );
        }

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
        const message = error instanceof Error ? error.message : "Proxy error";

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