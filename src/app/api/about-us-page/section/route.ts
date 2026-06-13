/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
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

        const res = await fetch(`${apiBase}/pages/about-us/section`, {
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
        });

        if (!res.ok) {
            return NextResponse.json(
                { success: false, message: `Upstream error ${res.status}` },
                { status: 502 }
            );
        }

        const data = await res.json();

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error?.message || "Fetch failed" },
            { status: 500 }
        );
    }
}