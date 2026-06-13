import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
    try {
        const apiBase = (API_URL ?? "").replace(/\/$/, "");

        if (!apiBase) {
            return NextResponse.json(
                {
                    success: false,
                    message: "NEXT_PUBLIC_API_URL is not configured",
                    data: null,
                },
                { status: 500 }
            );
        }

        const footerApiUrl = `${apiBase}/menus/slug/key-update/tree`;

        const response = await fetch(footerApiUrl, {
            method: "GET",
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
        });

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error("Footer API fetch error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch footer data",
                data: null,
            },
            { status: 500 }
        );
    }
}