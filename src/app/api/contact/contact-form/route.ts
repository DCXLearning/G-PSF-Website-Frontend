/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

const CONTACT_PATH = "/contact";

function getApiBase() {
    return (API_URL ?? "").replace(/\/$/, "");
}

export async function GET(req: Request) {
    try {
        const apiBase = getApiBase();

        if (!apiBase) {
            return NextResponse.json(
                { success: false, message: "NEXT_PUBLIC_API_URL is not configured" },
                { status: 500 }
            );
        }

        const url = new URL(req.url);
        const qs = url.searchParams.toString();

        const upstream = `${apiBase}${CONTACT_PATH}${qs ? `?${qs}` : ""}`;

        const res = await fetch(upstream, {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
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
            { success: false, message: err?.message || "Proxy GET error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const apiBase = getApiBase();

        if (!apiBase) {
            return NextResponse.json(
                { success: false, message: "NEXT_PUBLIC_API_URL is not configured" },
                { status: 500 }
            );
        }

        const body = await req.json();

        const upstream = `${apiBase}${CONTACT_PATH}`;

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