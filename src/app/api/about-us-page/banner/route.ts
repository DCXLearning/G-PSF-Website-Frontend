/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        const apiBase = (API_URL ?? "").replace(/\/$/, "");

        if (!apiBase) {
            return NextResponse.json(
                { success: false, message: "NEXT_PUBLIC_API_URL is not configured" },
                { status: 500 }
            );
        }

        const upstream = `${apiBase}/pages/about-us/section`;

        const res = await fetch(upstream, {
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
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

        return NextResponse.json(data, {
            status: res.status,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Proxy failed" },
            { status: 500 }
        );
    }
}