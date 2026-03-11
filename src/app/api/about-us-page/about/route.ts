/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const UPSTREAM =
    "https://api-gpsf.datacolabx.com/api/v1/pages/about-us/section";

export async function GET() {
    try {
        const res = await fetch(UPSTREAM, {
            cache: "no-store",
            headers: { Accept: "application/json" },
        });

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
            const text = await res.text();
            return new NextResponse(text, {
                status: res.status,
                headers: { "content-type": contentType || "text/plain" },
            });
        }

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Proxy failed" },
            { status: 500 }
        );
    }
}