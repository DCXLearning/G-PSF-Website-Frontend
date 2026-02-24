// src/app/api-about/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // always fetch fresh (no caching)

const UPSTREAM =
    "https://api-gpsf.datacolabx.com/api/v1/pages/about-us/section";

export async function GET() {
    try {
        const res = await fetch(UPSTREAM, {
            // You can adjust caching rules if you want:
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
        });

        const contentType = res.headers.get("content-type") || "";

        // If upstream didn't return JSON, pass the text back (useful for debugging)
        if (!contentType.includes("application/json")) {
            const text = await res.text();
            return new NextResponse(text, {
                status: res.status,
                headers: { "content-type": contentType || "text/plain" },
            });
        }

        const data = await res.json();

        return NextResponse.json(data, {
            status: res.status,
            // Optional: add your own headers here
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Proxy failed" },
            { status: 500 }
        );
    }
}