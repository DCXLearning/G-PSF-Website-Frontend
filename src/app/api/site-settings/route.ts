/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ===========fetch api Footer and contact Address========= */
export async function GET() {
    try {
        const upstream = await fetch(
            "https://api-gpsf.datacolabx.com/api/v1/site-settings/current",
            { cache: "no-store" }
        );

        const data = await upstream.json();
        return NextResponse.json(data, { status: upstream.status });
    } catch (e: any) {
        console.error("site-settings proxy error:", e);
        return NextResponse.json(
            { success: false, message: e?.message || "Proxy error" },
            { status: 500 }
        );
    }
}