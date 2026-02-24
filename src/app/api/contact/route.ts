import { NextResponse } from "next/server";

const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:3001").replace(
    /\/$/,
    ""
);

// ✅ GET /api/contact?page=1&limit=10&search=...
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const qs = url.searchParams.toString();

        const res = await fetch(
            `${BACKEND_URL}/api/v1/contact${qs ? `?${qs}` : ""}`,
            { cache: "no-store" }
        );

        const text = await res.text();
        return new NextResponse(text, {
            status: res.status,
            headers: {
                "Content-Type":
                    res.headers.get("content-type") || "application/json; charset=utf-8",
            },
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Proxy GET error" },
            { status: 500 }
        );
    }
}

// ✅ POST /api/contact  (create contact message)
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const res = await fetch(`${BACKEND_URL}/api/v1/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const text = await res.text();
        return new NextResponse(text, {
            status: res.status,
            headers: {
                "Content-Type":
                    res.headers.get("content-type") || "application/json; charset=utf-8",
            },
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message || "Proxy POST error" },
            { status: 500 }
        );
    }
}