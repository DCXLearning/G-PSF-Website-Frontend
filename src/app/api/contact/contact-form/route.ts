/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/contact/route.ts
import { NextResponse } from "next/server";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://api-gpsf.datacolabx.com/api/v1").replace(
    /\/$/,
    ""
);

const CONTACT_PATH = "/contact";

// GET /api/contact?page=1&limit=10&search=...
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const qs = url.searchParams.toString();

        const upstream = `${API_BASE}${CONTACT_PATH}${qs ? `?${qs}` : ""}`;

        const res = await fetch(upstream, {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
        });

        const text = await res.text();
        return new NextResponse(text, {
            status: res.status,
            headers: {
                "Content-Type": res.headers.get("content-type") || "application/json; charset=utf-8",
            },
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Proxy GET error" },
            { status: 500 }
        );
    }
}

// POST /api/contact
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const upstream = `${API_BASE}${CONTACT_PATH}`;

        const res = await fetch(upstream, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(body),
        });

        const text = await res.text();
        return new NextResponse(text, {
            status: res.status,
            headers: {
                "Content-Type": res.headers.get("content-type") || "application/json; charset=utf-8",
            },
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Proxy POST error" },
            { status: 500 }
        );
    }
}